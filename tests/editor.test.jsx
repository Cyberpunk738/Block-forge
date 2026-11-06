import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import Editor from '../src/components/Editor';
import ExportModal from '../src/components/ExportModal';
import useStore from '../src/store/useStore';
import { blocksToHtml } from '../src/utils/documentExport';
import { markdownToBlocks } from '../src/utils/markdownToBlocks';
import { convertDocumentToBlocks } from '../src/utils/documentImport';
import { validateBlocks } from '../src/utils/validateBlocks';

beforeEach(() => {
  localStorage.clear();
  const id = useStore.getState().createDocument();
  useStore.setState(s => ({ documents: s.documents.filter(d => d.id === id), histories: {} }));
});
const text = { id: 'a', type: 'text', content: 'hello world' };
describe('editing workflows', () => {
  it('keeps the latest keystroke when switching the mobile editor to preview and back', () => {
    useStore.getState().replaceAllBlocks([text]); render(<App />);
    fireEvent.change(screen.getAllByLabelText('Text block content')[0], { target: { value: 'latest keystroke' } });
    fireEvent.click(screen.getByRole('button', { name: 'Live Preview', exact: true }));
    expect(useStore.getState().blocks[0].content).toBe('latest keystroke');
    expect(screen.getByLabelText('Live Preview Panel').textContent).toContain('latest keystroke');
    fireEvent.click(screen.getByRole('button', { name: 'Editor', exact: true }));
    expect(screen.getAllByLabelText('Text block content')[0].value).toBe('latest keystroke');
  });
  it('splits paragraphs on Enter and preserves Shift+Enter for a line break', async () => {
    const user = userEvent.setup(); useStore.getState().replaceAllBlocks([text]); render(<Editor />);
    const field = screen.getByLabelText('Text block content');
    field.focus(); field.setSelectionRange(5, 6);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(useStore.getState().blocks.map(b => b.content)).toEqual(['hello', 'world']);
    const fields = screen.getAllByLabelText('Text block content');
    await user.click(fields[1]); await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(useStore.getState().blocks[1].content).toContain('\n');
    act(() => useStore.getState().undo());
    expect(useStore.getState().blocks[1].content).toBe('world');
  });
  it('filters slash commands and inserts the selected block without leaving a slash in content', async () => {
    const user = userEvent.setup(); useStore.getState().replaceAllBlocks([text]); render(<Editor />);
    await user.click(screen.getByLabelText('Text block content')); await user.keyboard(' /');
    const search = screen.getByLabelText('Search block types'); await user.type(search, 'code');
    expect(screen.queryByRole('menuitem', { name: /Heading/ })).toBeNull();
    await user.keyboard('{Enter}');
    expect(useStore.getState().blocks[1].type).toBe('code');
    expect(useStore.getState().blocks[0].content).toBe('hello world ');
    expect(screen.queryByLabelText('Search block types')).toBeNull();
  });
  it('shows a useful validation error and supports appending JSON', async () => {
    const user = userEvent.setup(); useStore.getState().replaceAllBlocks([text]); const close = vi.fn();
    render(<ExportModal isOpen onClose={close} initialTab="import" />);
    const input = screen.getByPlaceholderText('[{"id":"...","type":"text","content":"Hello"}]');
    fireEvent.change(input, { target: { value: '[{"id":"bad","type":"list","content":{"items":[null]}}]' } });
    await user.click(screen.getByRole('button', { name: 'Import Blocks' }));
    expect(screen.getByText(/Block 1:/)).toBeTruthy(); expect(close).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: JSON.stringify([text]) } });
    await user.click(screen.getByRole('button', { name: 'Import Blocks' }));
    expect(useStore.getState().blocks).toHaveLength(2); expect(close).toHaveBeenCalledOnce();
  });
  it('exports current content immediately, escaping HTML and unsafe URLs', () => {
    const html = blocksToHtml([{...text, content: '<script>alert(1)</script> [bad](javascript:alert)'}, {id:'b',type:'callout',content:{text:'Notice',variant:'warning'}}], '<Title>');
    expect(html).toContain('&lt;script&gt;'); expect(html).toContain('&lt;Title&gt;');
    expect(html).not.toContain('href="javascript:'); expect(html).not.toContain('<button');
    expect(html).toContain('@media print'); expect(html).toContain('WARNING');
  });
  it('imports Markdown and JSON files, including adjacent block boundaries', async () => {
    const md = 'Paragraph\n# Title\n\n- One\n- Two\n\n```js\nconst x = 1;\n```';
    expect(markdownToBlocks(md).map(b => b.type)).toEqual(['text','heading','list','code']);
    const blocks = await convertDocumentToBlocks(new File([md], 'notes.md'));
    expect(validateBlocks(blocks)).toHaveLength(4);
    const imported = await convertDocumentToBlocks(new File([JSON.stringify([text])], 'notes.json'));
    expect(imported).toEqual([text]);
    await expect(convertDocumentToBlocks(new File(['hi'], 'notes.pdf'))).rejects.toThrow('Unsupported file type');
  });
  it('cycles heading and callout options without a delayed edit reverting them', async () => {
    useStore.getState().replaceAllBlocks([{id:'h',type:'heading',content:{text:'Title',level:1}},{id:'c',type:'callout',content:{text:'Message',variant:'info'}}]);
    render(<Editor />);
    fireEvent.change(screen.getByPlaceholderText('Heading...'), {target:{value:'New title'}});
    fireEvent.click(screen.getByLabelText('Cycle heading level, currently H1'));
    fireEvent.change(screen.getByPlaceholderText('Info message...'), {target:{value:'New message'}});
    fireEvent.click(screen.getByTitle('Info — Click to change variant'));
    await waitFor(() => expect(useStore.getState().blocks[0].content).toEqual({text:'New title',level:2}));
    expect(useStore.getState().blocks[1].content).toEqual({text:'New message',variant:'warning'});
  });
});

describe('document files and navigation', () => {
  it('exports all block types without editor chrome or scripts', () => {
    const blocks = [text,
      {id:'h',type:'heading',content:{text:'Title',level:2}},
      {id:'i',type:'image',content:{url:'https://example.com/image.png',alt:'Image caption'}},
      {id:'c',type:'code',content:{code:'<div>code</div>',language:'html'}},
      {id:'q',type:'quote',content:{text:'Quotation',author:'Author'}},
      {id:'l',type:'list',content:{items:['One','Two'],ordered:true}},
      {id:'d',type:'divider',content:{style:'solid'}},
      {id:'notice',type:'callout',content:{text:'Notice',variant:'info'}},
    ];
    const html = blocksToHtml(validateBlocks(blocks), 'Report');
    for (const marker of ['<h2>Title</h2>','<img','<pre>','<blockquote>','<ol>','<hr','class="callout"','hello world']) expect(html).toContain(marker);
    expect(html).not.toMatch(/<script|<button|textarea|drag/i);
  });
  it('keeps fenced code containing backticks intact through Markdown export/import', async () => {
    const { blocksToMarkdown } = await import('../src/utils/blocksToMarkdown');
    const code = { id:'c',type:'code',content:{language:'md',code:'```js\nconst a = 1;\n```'} };
    expect(markdownToBlocks(blocksToMarkdown([code]))[0].content).toEqual(code.content);
  });
  it('reopens documents and duplicates through the sidebar without mixing content', async () => {
    const user = userEvent.setup(); render(<App />);
    fireEvent.change(screen.getByLabelText('Document title'), {target:{value:'First document'}});
    fireEvent.click(screen.getByRole('button',{name:'Add Text Block'}));
    fireEvent.change(screen.getByLabelText('Text block content'),{target:{value:'First content'}});
    await user.click(screen.getByLabelText('New document'));
    expect(useStore.getState().blocks).toEqual([]);
    fireEvent.change(screen.getByLabelText('Document title'),{target:{value:'Second document'}});
    await user.click(screen.getByRole('button',{name:/First document/}));
    expect(screen.getByLabelText('Text block content').value).toBe('First content');
    await user.click(screen.getByLabelText('Duplicate document'));
    expect(screen.getByLabelText('Document title').value).toBe('First document (copy)');
    expect(screen.getByLabelText('Text block content').value).toBe('First content');
  });
  it('converts a real DOCX fixture into document blocks', async () => {
    const { readFileSync } = await import('node:fs');
    const bytes = readFileSync('tests/fixtures/sample.docx');
    const file = new File([bytes], 'sample.docx');
    file.arrayBuffer = async () => new Uint8Array([...bytes]).buffer;
    const blocks = await convertDocumentToBlocks(file);
    expect(blocks[0].content).toBe('Sample imported document');
  });
});

it('allows ordinary slashes inside URLs without opening commands', async () => {
  const user = userEvent.setup(); useStore.getState().replaceAllBlocks([{ ...text, content: '' }]); render(<Editor />);
  await user.click(screen.getByLabelText('Text block content')); await user.type(screen.getByLabelText('Text block content'), 'https://example.com/a/b');
  expect(useStore.getState().blocks[0].content).toBe('https://example.com/a/b');
  expect(screen.queryByLabelText('Search block types')).toBeNull();
});
