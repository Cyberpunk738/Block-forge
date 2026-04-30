import { useEffect, useState } from 'react';
import { Undo2, Redo2, Layers, Trash2, Download } from 'lucide-react';
import useStore from '../store/useStore';
import ExportModal from './ExportModal';

/**
 * Toolbar — Top bar with undo/redo, block count, export, and clear all.
 * Also registers keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z).
 */
const Toolbar = () => {
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);
  const blocks = useStore((s) => s.blocks);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const clearAll = useStore((s) => s.clearAll);

  const [showExport, setShowExport] = useState(false);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y / Cmd+Y = Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary/80 backdrop-blur-md
                      border-b border-border-default sticky top-0 z-40">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
              BlockForge
            </h1>
            <span className="text-[11px] text-text-muted">
              {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button
            id="toolbar-undo"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all duration-150
                       enabled:text-text-secondary enabled:hover:text-text-primary 
                       enabled:hover:bg-bg-hover
                       disabled:text-text-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo2 size={15} />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Redo */}
          <button
            id="toolbar-redo"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all duration-150
                       enabled:text-text-secondary enabled:hover:text-text-primary 
                       enabled:hover:bg-bg-hover
                       disabled:text-text-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Redo2 size={15} />
            <span className="hidden sm:inline">Redo</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border-default mx-1" />

          {/* Export */}
          <button
            id="toolbar-export"
            onClick={() => setShowExport(true)}
            title="Export / Import"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all duration-150
                       text-text-secondary hover:text-text-primary hover:bg-bg-hover"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border-default mx-1" />

          {/* Clear All */}
          <button
            id="toolbar-clear"
            onClick={clearAll}
            disabled={blocks.length === 0}
            title="Clear all blocks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all duration-150
                       enabled:text-text-secondary enabled:hover:text-danger 
                       enabled:hover:bg-danger-subtle
                       disabled:text-text-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </>
  );
};

export default Toolbar;
