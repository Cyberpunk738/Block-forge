import { lazy, Suspense, useEffect, useState } from 'react';
import { Undo2, Redo2, Layers, Trash2, Download, FileUp, Columns, Edit3, Eye } from 'lucide-react';
import useStore from '../store/useStore';
const ExportModal = lazy(() => import('./ExportModal'));

/**
 * Toolbar — Top bar with view switcher, undo/redo, block count, export, and clear all.
 */
const Toolbar = ({ viewMode = 'split', onViewModeChange }) => {
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);
  const blocks = useStore((s) => s.blocks);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const clearAll = useStore((s) => s.clearAll);

  const saveStatus = useStore(s => s.saveStatus);
  const [exportTab, setExportTab] = useState('json');
  const [showExport, setShowExport] = useState(false);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest?.('[role="dialog"], [role="alertdialog"]') || e.target.getAttribute?.('aria-label') === 'Document title' || e.isComposing) return;
      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y / Cmd+Y = Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <>
      <header
        role="toolbar"
        aria-label="Editor Toolbar"
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-bg-secondary/90 backdrop-blur-md
                   border-b border-border-default sticky top-0 z-40 transition-colors duration-200"
      >
        {/* Left: Brand & Autosave Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white shadow-sm">
            <Layers size={17} />
          </div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
              BlockForge
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-default text-[11px] text-text-muted font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span role="status">{saveStatus === 'saved' ? 'Saved locally' : 'Not saved'}</span>
              <span className="text-text-muted/60">•</span>
              <span>{blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: View Mode Selector & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Desktop View Mode Segmented Control */}
          {onViewModeChange && (
            <div className="hidden lg:flex items-center p-1 rounded-xl bg-bg-tertiary border border-border-default shadow-xs">
              <button
                onClick={() => onViewModeChange('editor')}
                title="Editor Mode (Focus on writing)"
                aria-label="Editor view"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 focus-ring ${
                  viewMode === 'editor'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/60'
                }`}
              >
                <Edit3 size={13} />
                <span>Editor</span>
              </button>

              <button
                onClick={() => onViewModeChange('split')}
                title="Split Screen (Side-by-side Editor & Preview)"
                aria-label="Split view"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 focus-ring ${
                  viewMode === 'split'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/60'
                }`}
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>

              <button
                onClick={() => onViewModeChange('preview')}
                title="Live Preview (Published document output)"
                aria-label="Live preview"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 focus-ring ${
                  viewMode === 'preview'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/60'
                }`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            </div>
          )}

          <div className="hidden lg:block w-px h-5 bg-border-default mx-0.5" />

          {/* History Controls (Undo / Redo) */}
          <div className="flex items-center gap-0.5 bg-bg-tertiary/70 p-0.5 rounded-lg border border-border-default">
            <button
              id="toolbar-undo"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                         transition-all duration-150 focus-ring
                         enabled:text-text-secondary enabled:hover:text-text-primary 
                         enabled:hover:bg-bg-hover enabled:active:scale-95
                         disabled:text-text-muted/40 disabled:cursor-not-allowed"
            >
              <Undo2 size={13} />
              <span className="hidden md:inline">Undo</span>
            </button>

            <button
              id="toolbar-redo"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo action"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                         transition-all duration-150 focus-ring
                         enabled:text-text-secondary enabled:hover:text-text-primary 
                         enabled:hover:bg-bg-hover enabled:active:scale-95
                         disabled:text-text-muted/40 disabled:cursor-not-allowed"
            >
              <Redo2 size={13} />
              <span className="hidden md:inline">Redo</span>
            </button>
          </div>

          <div className="w-px h-5 bg-border-default mx-0.5" />

          {/* Document Operations: Export / Import */}
          <div className="flex items-center gap-1.5">
            <button
              id="toolbar-export"
              onClick={() => { setExportTab('json'); setShowExport(true); }}
              title="Export Document (JSON / Markdown)"
              aria-label="Export Document"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                         transition-all duration-150 focus-ring border border-border-default
                         bg-bg-tertiary text-text-primary hover:bg-bg-hover hover:border-border-hover active:scale-95 shadow-xs"
            >
              <Download size={13} className="text-text-primary" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              id="toolbar-import"
              onClick={() => { setExportTab('import'); setShowExport(true); }}
              title="Import Document (.txt, .md, .json, .docx)"
              aria-label="Import Document"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                         transition-all duration-150 focus-ring border border-border-default
                         bg-bg-tertiary text-text-primary hover:bg-bg-hover hover:border-border-hover active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <FileUp size={13} className="text-text-primary" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>

          <div className="w-px h-5 bg-border-default mx-0.5" />

          {/* Reset Control */}
          <button
            id="toolbar-clear"
            onClick={() => { if (window.confirm('Clear all blocks in this document? You can undo this action.')) clearAll(); }}
            disabled={blocks.length === 0}
            title="Clear canvas"
            aria-label="Clear all blocks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       transition-all duration-150 focus-ring border border-transparent
                       enabled:text-text-secondary enabled:hover:text-danger 
                       enabled:hover:bg-danger-subtle enabled:hover:border-danger/20 enabled:active:scale-95
                       disabled:text-text-muted/30 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Export Modal */}
      <Suspense fallback={<p role="status">Loading document tools…</p>}>
      {showExport && <ExportModal key={exportTab + String(showExport)} initialTab={exportTab} isOpen={showExport} onClose={() => setShowExport(false)} />}
      </Suspense>
    </>
  );
};

export default Toolbar;
