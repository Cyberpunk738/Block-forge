import { describe, it, expect, vi } from 'vitest';
import { createWorkspaceStore, STORAGE_KEY } from '../src/store/useStore';
const text = (id = 'a', content = 'hello') => ({ id, type: 'text', content });
function memory(initial = {}) {
  const data = { ...initial };
  return { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
}
describe('document workspace', () => {
  it('migrates legacy content and persists edits immediately', () => {
    const storage = memory({ 'blockforge-blocks': JSON.stringify([text()]) });
    const store = createWorkspaceStore(storage);
    expect(store.getState().documents[0].title).toBe('Recovered document');
    store.getState().updateBlock('a', 'latest');
    expect(JSON.parse(storage.getItem(STORAGE_KEY)).documents[0].blocks[0].content).toBe('latest');
    expect(createWorkspaceStore(storage).getState().blocks[0].content).toBe('latest');
  });
  it('groups typing, separates pauses and restores undo/redo', () => {
    vi.useFakeTimers();
    const store = createWorkspaceStore(memory()), s = store.getState;
    const id = s().addBlock('text', '');
    s().updateBlock(id, 'h'); s().updateBlock(id, 'hi');
    s().undo(); expect(s().blocks[0].content).toBe('');
    s().redo(); expect(s().blocks[0].content).toBe('hi');
    vi.advanceTimersByTime(800); s().updateBlock(id, 'hi!');
    vi.advanceTimersByTime(800); s().updateBlock(id, 'hi!!');
    s().undo(); expect(s().blocks[0].content).toBe('hi!');
    vi.useRealTimers();
  });
  it('keeps content and histories separate across documents and reloads', () => {
    const storage = memory(), store = createWorkspaceStore(storage), s = store.getState;
    const first = s().activeDocumentId; s().replaceAllBlocks([text()]);
    const second = s().createDocument(); s().renameDocument(second, 'Proposal'); s().replaceAllBlocks([text('b', 'other')]);
    s().selectDocument(first); s().undo(); expect(s().blocks).toEqual([]);
    s().selectDocument(second); expect(s().blocks[0].content).toBe('other');
    s().undo(); expect(s().blocks).toEqual([]);
    s().redo(); expect(s().blocks[0].content).toBe('other');
    expect(createWorkspaceStore(storage).getState().activeDocumentId).toBe(second);
  });
  it('duplicates independently and creates a blank document after deleting the last one', () => {
    const store = createWorkspaceStore(memory()), s = store.getState;
    s().replaceAllBlocks([text()]); const original = s().activeDocumentId;
    s().duplicateDocument(original); const duplicate = s().activeDocumentId;
    expect(s().blocks[0].id).not.toBe('a'); s().updateBlock(s().blocks[0].id, 'copy');
    s().selectDocument(original); expect(s().blocks[0].content).toBe('hello');
    s().deleteDocument(original); expect(s().activeDocumentId).toBe(duplicate);
    s().deleteDocument(duplicate); expect(s().documents).toHaveLength(1); expect(s().blocks).toEqual([]);
  });
  it('imports into an empty canvas as an undoable action, appends with new ids and rejects malformed data atomically', () => {
    const store = createWorkspaceStore(memory()), s = store.getState;
    s().importBlocks([text()]); s().undo(); expect(s().blocks).toEqual([]); s().redo();
    s().importBlocks([text()], 'append'); expect(new Set(s().blocks.map(b => b.id)).size).toBe(2);
    const previous = s().blocks;
    expect(() => s().importBlocks([{ id: 'bad', type: 'list', content: { items: [null] } }])).toThrow('Block 1');
    expect(s().blocks).toBe(previous);
  });
  it('reports failed saves and retries without discarding in-memory edits', () => {
    const storage = memory(), store = createWorkspaceStore(storage), s = store.getState;
    const write = storage.setItem; storage.setItem = () => { throw new Error('quota'); };
    s().replaceAllBlocks([text()]); expect(s().saveStatus).toBe('error'); expect(s().blocks).toHaveLength(1);
    storage.setItem = write; s().retrySave(); expect(s().saveStatus).toBe('saved');
  });
  it('preserves corrupt stored data until explicit recovery', () => {
    const storage = memory({ [STORAGE_KEY]: '{broken' }), store = createWorkspaceStore(storage), s = store.getState;
    s().replaceAllBlocks([text()]); expect(storage.getItem(STORAGE_KEY)).toBe('{broken');
    expect(s().getStoredBackup()).toBe('{broken'); expect(s().recoveryRequired).toBe(true);
    s().recoverStorage(); expect(s().saveStatus).toBe('saved');
  });
  it('splits selected text atomically and undoes it', () => {
    const store = createWorkspaceStore(memory()), s = store.getState;
    s().replaceAllBlocks([text('a', 'hello world')]); const id = s().splitBlock('a', 5, 6);
    expect(s().blocks.map(b => b.content)).toEqual(['hello', 'world']); expect(s().blocks[1].id).toBe(id);
    s().undo(); expect(s().blocks).toEqual([text('a', 'hello world')]);
  });
  it('ignores no-op updates and invalid reorder indices', () => {
    const store = createWorkspaceStore(memory()), s = store.getState; s().replaceAllBlocks([text()]);
    const history = s().past; s().updateBlock('missing', 'x'); s().moveBlock(-1, 0); s().updateBlock('a', 'hello');
    expect(s().past).toBe(history);
  });
});
