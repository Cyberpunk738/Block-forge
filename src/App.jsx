import { useEffect, useState } from 'react';
import './components/blocks';
import Toolbar from './components/Toolbar';
import DocumentsSidebar from './components/DocumentsSidebar';
import SaveNotice from './components/SaveNotice';
import Editor from './components/Editor';
import LivePreview from './components/Renderer/LivePreview';
import useStore from './store/useStore';
import { Edit3, Eye } from 'lucide-react';

export default function App() {
  const activeDocumentId = useStore(s => s.activeDocumentId);
  const saveStatus = useStore(s => s.saveStatus);
  const [viewMode, setViewMode] = useState('editor');
  const [mobileTab, setMobileTab] = useState('editor');
  useEffect(() => {
    if (saveStatus !== 'error') return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saveStatus]);
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />
      <SaveNotice />
      <nav aria-label="Mobile view switcher" className="lg:hidden flex border-b border-border-default bg-bg-secondary sticky top-[53px] z-30">
        <button aria-pressed={mobileTab === 'editor'} onClick={() => setMobileTab('editor')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-b-2 focus-ring ${mobileTab === 'editor' ? 'border-accent text-text-primary' : 'border-transparent text-text-muted'}`}><Edit3 size={14} />Editor</button>
        <button aria-pressed={mobileTab === 'preview'} onClick={() => setMobileTab('preview')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-b-2 focus-ring ${mobileTab === 'preview' ? 'border-accent text-text-primary' : 'border-transparent text-text-muted'}`}><Eye size={14} />Live Preview</button>
      </nav>
      <div className="workspace-body flex-1 flex flex-col lg:flex-row min-w-0">
        <DocumentsSidebar />
        <div key={activeDocumentId} className="document-surface flex flex-1 min-w-0">
          <div className={`min-w-0 flex-1 overflow-y-auto ${mobileTab === 'editor' ? 'block' : 'hidden'} ${viewMode === 'preview' ? 'lg:hidden' : 'lg:block'} ${viewMode === 'split' ? 'lg:w-1/2' : ''}`}><Editor /></div>
          <div className={`min-w-0 flex-1 overflow-y-auto ${mobileTab === 'preview' ? 'block' : 'hidden'} ${viewMode === 'editor' ? 'lg:hidden' : 'lg:block'} ${viewMode === 'split' ? 'lg:w-1/2' : ''}`}><LivePreview /></div>
        </div>
      </div>
    </div>
  );
}
