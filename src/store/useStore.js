import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { validateBlocks } from '../utils/validateBlocks.js';

export const STORAGE_KEY = 'blockforge-workspace-v1';
const clone = value => JSON.parse(JSON.stringify(value));
const makeDocument = (title = 'Untitled document', blocks = []) => ({ id: nanoid(10), title, blocks, updatedAt: Date.now() });

export function createWorkspaceStore(storage = globalThis.localStorage) {
  let documents, activeDocumentId, loadError = '';
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !Array.isArray(saved.documents) || !saved.documents.length) throw new Error('Invalid workspace');
      const ids = new Set();
      for (const doc of saved.documents) {
        if (typeof doc.id !== 'string' || !doc.id || ids.has(doc.id) || typeof doc.title !== 'string' || !Number.isFinite(doc.updatedAt)) throw new Error('Invalid document');
        ids.add(doc.id); validateBlocks(doc.blocks);
      }
      documents = saved.documents;
      activeDocumentId = documents.some(d => d.id === saved.activeDocumentId) ? saved.activeDocumentId : documents[0].id;
    } else {
      const legacy = storage.getItem('blockforge-blocks');
      documents = [makeDocument(legacy ? 'Recovered document' : undefined, legacy ? validateBlocks(JSON.parse(legacy)) : [])];
    }
  } catch {
    loadError = 'Saved data could not be loaded. Download the stored backup before saving new work.';
    documents = [makeDocument()];
  }
  activeDocumentId ||= documents[0].id;
  return create((set, get) => {
    const persist = () => {
      const s = get();
      if (s.recoveryRequired) return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, documents: s.documents, activeDocumentId: s.activeDocumentId }));
        set({ saveStatus: 'saved', saveError: '' });
      } catch {
        set({ saveStatus: 'error', saveError: 'Changes are in memory only. Storage is unavailable or full. Export your work or retry saving.' });
      }
    };
    const commit = (blocks, group = null) => {
      const s = get();
      if (JSON.stringify(blocks) === JSON.stringify(s.blocks)) return;
      const now = Date.now(), grouped = group && s.editGroup === group && now - s.lastEdit < 700;
      set({ blocks, past: grouped ? s.past : [...s.past, clone(s.blocks)].slice(-50), future: [], editGroup: group, lastEdit: now,
        documents: s.documents.map(d => d.id === s.activeDocumentId ? { ...d, blocks, updatedAt: now } : d) });
      persist();
    };
    const activate = id => {
      const s = get(), doc = s.documents.find(d => d.id === id);
      if (!doc || id === s.activeDocumentId) return;
      const histories = { ...s.histories, [s.activeDocumentId]: { past: s.past, future: s.future } };
      set({ activeDocumentId: id, blocks: doc.blocks, past: histories[id]?.past || [], future: histories[id]?.future || [], histories, editGroup: null });
      persist();
    };
    return {
      documents, activeDocumentId, blocks: documents.find(d => d.id === activeDocumentId).blocks,
      past: [], future: [], histories: {}, editGroup: null, lastEdit: 0,
      saveStatus: loadError ? 'error' : 'saved', saveError: loadError, recoveryRequired: !!loadError,
      retrySave: persist,
      recoverStorage: () => { set({ recoveryRequired: false }); persist(); },
      getStoredBackup: () => storage.getItem(STORAGE_KEY) || storage.getItem('blockforge-blocks') || '',
      endEditGroup: () => set({ editGroup: null }),
      selectDocument: activate,
      createDocument: () => { const doc = makeDocument(); set({ documents: [...get().documents, doc] }); activate(doc.id); return doc.id; },
      renameDocument: (id, title) => { set({ documents: get().documents.map(d => d.id === id ? { ...d, title, updatedAt: Date.now() } : d) }); persist(); },
      duplicateDocument: id => {
        const source = get().documents.find(d => d.id === id);
        if (!source) return;
        const doc = makeDocument(`${source.title || 'Untitled document'} (copy)`, clone(source.blocks).map(b => ({ ...b, id: nanoid(10) })));
        set({ documents: [...get().documents, doc] }); activate(doc.id);
      },
      deleteDocument: id => {
        const s = get(); let next = s.documents.filter(d => d.id !== id);
        if (next.length === s.documents.length) return;
        if (!next.length) next = [makeDocument()];
        const histories = { ...s.histories }; delete histories[id];
        set({ documents: next, histories });
        if (s.activeDocumentId === id) { activate(next[0].id); const h = { ...get().histories }; delete h[id]; set({ histories: h }); }
        persist();
      },
      addBlock: (type, content, index) => {
        const blocks = [...get().blocks], id = nanoid(10);
        blocks.splice(Number.isInteger(index) ? Math.max(0, Math.min(index, blocks.length)) : blocks.length, 0, { id, type, content: clone(content) });
        commit(blocks); return id;
      },
      updateBlock: (id, content) => commit(get().blocks.map(b => b.id === id ? { ...b, content: typeof b.content === 'object' && b.content && typeof content === 'object' && content ? { ...b.content, ...content } : content } : b), id),
      deleteBlock: id => commit(get().blocks.filter(b => b.id !== id)),
      moveBlock: (from, to) => {
        const blocks = [...get().blocks];
        if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return;
        blocks.splice(to, 0, blocks.splice(from, 1)[0]); commit(blocks);
      },
      splitBlock: (id, start, end) => {
        const blocks = clone(get().blocks), index = blocks.findIndex(b => b.id === id), block = blocks[index];
        if (!block || !['text','heading'].includes(block.type)) return;
        const text = block.type === 'text' ? block.content : block.content.text;
        if (block.type === 'text') block.content = text.slice(0, start); else block.content.text = text.slice(0, start);
        const nextId = nanoid(10);
        blocks.splice(index + 1, 0, { id: nextId, type: 'text', content: text.slice(end) });
        commit(blocks); return nextId;
      },
      undo: () => {
        const s = get(); if (!s.past.length) return;
        const blocks = s.past.at(-1);
        set({ blocks, past: s.past.slice(0,-1), future: [clone(s.blocks), ...s.future], editGroup: null,
          documents: s.documents.map(d => d.id === s.activeDocumentId ? { ...d, blocks, updatedAt: Date.now() } : d) }); persist();
      },
      redo: () => {
        const s = get(); if (!s.future.length) return;
        const blocks = s.future[0];
        set({ blocks, past: [...s.past, clone(s.blocks)].slice(-50), future: s.future.slice(1), editGroup: null,
          documents: s.documents.map(d => d.id === s.activeDocumentId ? { ...d, blocks, updatedAt: Date.now() } : d) }); persist();
      },
      canUndo: () => get().past.length > 0, canRedo: () => get().future.length > 0,
      clearAll: () => commit([]),
      replaceAllBlocks: blocks => commit(clone(validateBlocks(blocks))),
      importBlocks: (blocks, mode = 'replace') => { validateBlocks(blocks); const incoming = clone(blocks).map(b => ({ ...b, id: nanoid(10) })); commit(mode === 'append' ? [...get().blocks, ...incoming] : incoming); },
    };
  });
}
const useStore = createWorkspaceStore();
export default useStore;
