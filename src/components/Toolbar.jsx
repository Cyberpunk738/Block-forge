import { useEffect, useState, useRef } from 'react';
import { Undo2, Redo2, Layers, Trash2, Download, FileUp, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { convertDocumentToBlocks } from '../utils/documentImport';
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

  const replaceAllBlocks = useStore((s) => s.replaceAllBlocks);

  const [showExport, setShowExport] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const newBlocks = await convertDocumentToBlocks(file);
      if (newBlocks.length > 0) {
        replaceAllBlocks(newBlocks);
      }
    } catch {
      // silently fail — user can use the modal for detailed errors
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Saved</span>
              <span className="text-text-muted/60">•</span>
              <span>{blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}</span>
            </div>
          </div>
        </div>

        {/* Right: Action Controls Group */}
        <div className="flex items-center gap-1">
          {/* History Controls */}
          <div className="flex items-center gap-0.5 bg-bg-tertiary/50 p-0.5 rounded-lg border border-border-default">
            <button
              id="toolbar-undo"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                         transition-all duration-150 focus-ring
                         enabled:text-text-secondary enabled:hover:text-text-primary 
                         enabled:hover:bg-bg-hover enabled:active:scale-95
                         disabled:text-text-muted/50 disabled:cursor-not-allowed"
            >
              <Undo2 size={14} />
              <span className="hidden md:inline">Undo</span>
            </button>

            <button
              id="toolbar-redo"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo action"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                         transition-all duration-150 focus-ring
                         enabled:text-text-secondary enabled:hover:text-text-primary 
                         enabled:hover:bg-bg-hover enabled:active:scale-95
                         disabled:text-text-muted/50 disabled:cursor-not-allowed"
            >
              <Redo2 size={14} />
              <span className="hidden md:inline">Redo</span>
            </button>
          </div>

          <div className="w-px h-4 bg-border-default mx-1" />

          {/* Import / Export Controls */}
          <button
            id="toolbar-export"
            onClick={() => setShowExport(true)}
            title="Export or Import Document"
            aria-label="Export or Import Document"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       transition-all duration-150 focus-ring
                       text-text-secondary hover:text-text-primary hover:bg-bg-hover active:scale-95"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            id="toolbar-import"
            onClick={handleImportClick}
            disabled={importing}
            title="Import document (.txt, .docx)"
            aria-label="Import document"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       transition-all duration-150 focus-ring
                       text-text-secondary hover:text-text-primary hover:bg-bg-hover active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
            <span className="hidden sm:inline">{importing ? 'Importing...' : 'Import'}</span>
          </button>

          <div className="w-px h-4 bg-border-default mx-1" />

          {/* Danger / Reset Control */}
          <button
            id="toolbar-clear"
            onClick={clearAll}
            disabled={blocks.length === 0}
            title="Clear all blocks"
            aria-label="Clear all blocks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       transition-all duration-150 focus-ring
                       enabled:text-text-secondary enabled:hover:text-danger 
                       enabled:hover:bg-danger-subtle enabled:active:scale-95
                       disabled:text-text-muted/40 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Export Modal */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </>
  );
};

export default Toolbar;
