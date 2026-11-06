import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Copy, Trash2, FolderOpen } from 'lucide-react';
import useStore from '../store/useStore';

export default function DocumentsSidebar() {
  const documents = useStore(s => s.documents);
  const activeId = useStore(s => s.activeDocumentId);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!deleting) return;
    const previous = document.activeElement;
    return () => previous?.focus();
  }, [deleting]);
  const active = documents.find(d => d.id === activeId);
  const actions = useStore.getState;
  return (
    <aside className="documents-sidebar border-r border-border-default bg-bg-secondary p-3 lg:w-60 lg:shrink-0">
      <button className="lg:hidden flex items-center gap-2 text-sm font-semibold w-full p-2 focus-ring" aria-expanded={open} onClick={() => setOpen(!open)}>
        <FolderOpen size={16} /> {active?.title || 'Untitled document'} <span className="ml-auto text-xs">Documents</span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} lg:block`}>
        <div className="flex items-center justify-between px-2 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Documents</h2>
          <button aria-label="New document" title="New document" className="p-2 rounded hover:bg-bg-hover focus-ring" onClick={() => { actions().createDocument(); setOpen(false); }}><Plus size={16} /></button>
        </div>
        <nav aria-label="Documents" className="space-y-1">
          {documents.map(doc => (
            <div key={doc.id} className={`rounded-lg border ${doc.id === activeId ? 'border-border-hover bg-bg-primary' : 'border-transparent'}`}>
              <button aria-current={doc.id === activeId ? 'page' : undefined} className="w-full text-left p-2 rounded-lg hover:bg-bg-hover focus-ring" onClick={() => { actions().selectDocument(doc.id); setOpen(false); }}>
                <span className="flex items-center gap-2 text-sm"><FileText size={14} className="shrink-0" /><span className="truncate">{doc.title || 'Untitled document'}</span></span>
                <time dateTime={new Date(doc.updatedAt).toISOString()} className="block pl-5 mt-1 text-[10px] text-text-muted">{new Date(doc.updatedAt).toLocaleString()}</time>
              </button>
              {doc.id === activeId && <div className="flex justify-end gap-1 px-2 pb-2">
                <button className="p-1.5 rounded hover:bg-bg-hover focus-ring" aria-label="Duplicate document" onClick={() => actions().duplicateDocument(doc.id)}><Copy size={13} /></button>
                <button className="p-1.5 rounded hover:bg-bg-hover focus-ring" aria-label="Delete document" onClick={() => setDeleting(doc)}><Trash2 size={13} /></button>
              </div>}
            </div>
          ))}
        </nav>
      </div>
      {deleting && <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" ref={dialogRef} onKeyDown={e => {
        if (e.key === 'Escape') setDeleting(null);
        if (e.key === 'Tab') {
          const buttons = [...dialogRef.current.querySelectorAll('button')];
          if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons.at(-1).focus(); }
          if (!e.shiftKey && document.activeElement === buttons.at(-1)) { e.preventDefault(); buttons[0].focus(); }
        }
      }}>
        <div className="bg-bg-primary rounded-xl border p-6 max-w-sm shadow-xl">
          <h2 id="delete-title" className="font-bold mb-2">Delete “{deleting.title || 'Untitled document'}”?</h2>
          <p className="text-sm text-text-secondary mb-4">This permanently removes this document. Export a copy first if you need it.</p>
          <div className="flex gap-3">
            <button autoFocus className="px-3 py-2 rounded border focus-ring" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="px-3 py-2 rounded bg-accent text-white focus-ring" onClick={() => { actions().deleteDocument(deleting.id); setDeleting(null); }}>Delete document</button>
          </div>
        </div>
      </div>}
    </aside>
  );
}
