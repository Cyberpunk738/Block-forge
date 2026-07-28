import { useState } from 'react';
// Initialize block registry (must run before any rendering)
import './components/blocks';

import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import LivePreview from './components/Renderer/LivePreview';
import { Edit3, Eye } from 'lucide-react';

/**
 * App — Root shell for BlockForge.
 * Composes Toolbar, Editor, and LivePreview into responsive split-screen & mobile tabbed layout.
 */
const App = () => {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* ── Mobile Tab Navigation (visible below lg breakpoint) ── */}
      <nav
        aria-label="Mobile view switcher"
        className="lg:hidden flex border-b border-border-default bg-bg-secondary sticky top-[53px] z-30"
      >
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 focus-ring ${
            mobileTab === 'editor'
              ? 'border-accent text-text-primary bg-bg-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Edit3 size={14} />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 focus-ring ${
            mobileTab === 'preview'
              ? 'border-accent text-text-primary bg-bg-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Eye size={14} />
          <span>Live Preview</span>
        </button>
      </nav>

      {/* ── Main Layout Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile View Handling */}
        <div className="w-full lg:hidden flex-1 flex flex-col min-h-[calc(100vh-100px)]">
          {mobileTab === 'editor' ? (
            <Editor />
          ) : (
            <div className="flex-1 min-h-[calc(100vh-100px)]">
              <LivePreview />
            </div>
          )}
        </div>

        {/* Desktop Split & View Modes (lg breakpoint and up) */}
        <div className="hidden lg:flex w-full flex-1">
          {/* Editor Container */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div
              className={`flex-1 overflow-y-auto ${
                viewMode === 'split' ? 'w-1/2 max-w-[55%]' : 'w-full'
              }`}
            >
              <Editor />
            </div>
          )}

          {/* Live Preview Container */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className={`flex-1 overflow-y-auto ${
                viewMode === 'split' ? 'w-1/2 min-w-[45%]' : 'w-full'
              }`}
            >
              <LivePreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

