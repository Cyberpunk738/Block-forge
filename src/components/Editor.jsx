import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import useStore from '../store/useStore';
import BlockWrapper from './BlockWrapper';
import AddBlockMenu from './AddBlockMenu';
import SlashCommandMenu from './SlashCommandMenu';
import { Layers, Plus, Sparkles, Command } from 'lucide-react';

/**
 * Editor — Main editor surface.
 *
 * Renders the block list inside a DnD context with vertical sortable.
 * Blocks are resolved and wrapped by BlockWrapper.
 */
const Editor = () => {
  const blocks = useStore((s) => s.blocks);
  const moveBlock = useStore((s) => s.moveBlock);
  const addBlock = useStore((s) => s.addBlock);

  const activeDocument = useStore(s => s.documents.find(d => d.id === s.activeDocumentId));
  const focusBlock = (id, atEnd = false) => requestAnimationFrame(() => {
    const el = document.getElementById(`block-${id}`)?.querySelector('textarea, input');
    el?.focus();
    if (el?.setSelectionRange) { const offset = atEnd ? el.value.length : 0; el.setSelectionRange(offset, offset); }
  });

  // ── Slash Command State ──
  const [slashState, setSlashState] = useState({
    isOpen: false,
    blockId: null,
    query: '',
    position: { top: 0, left: 0 },
  });

  // ── DnD Sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Sortable IDs ──
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  // ── Handle Drag End ──
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = blocks.findIndex((b) => b.id === active.id);
      const toIndex = blocks.findIndex((b) => b.id === over.id);

      if (fromIndex !== -1 && toIndex !== -1) {
        moveBlock(fromIndex, toIndex);
      }
    },
    [blocks, moveBlock]
  );

  // ── Block KeyDown Handler for Slash Command ──
  const handleBlockKeyDown = useCallback(
    (e, blockId, blockType) => {
      if (e.nativeEvent?.isComposing || e.isComposing) return;
      const target = e.target;
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && /(^|\s)$/.test(target.value.slice(0, target.selectionStart)) && (blockType === 'text' || blockType === 'heading')) {
        e.preventDefault();
        const rect = target.getBoundingClientRect();
        setSlashState({ isOpen: true, blockId, query: '', position: { top: Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 340)), left: Math.max(8, Math.min(rect.left, window.innerWidth - 296)) } });
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || !['text', 'heading'].includes(blockType)) return;
      const state = useStore.getState();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        focusBlock(state.splitBlock(blockId, target.selectionStart, target.selectionEnd));
      }
      const index = state.blocks.findIndex(b => b.id === blockId);
      const start = target.selectionStart, end = target.selectionEnd;
      if (e.key === 'ArrowUp' && start === 0 && end === 0 && index > 0) {
        e.preventDefault(); focusBlock(state.blocks[index - 1].id, true);
      }
      if (e.key === 'ArrowDown' && start === target.value.length && end === start && index < state.blocks.length - 1) {
        e.preventDefault(); focusBlock(state.blocks[index + 1].id);
      }
    },
    []
  );

  const handleSelectSlashBlock = useCallback(
    (type, defaultData) => {
      const targetIndex = blocks.findIndex((b) => b.id === slashState.blockId);
      const insertIdx = targetIndex >= 0 ? targetIndex + 1 : blocks.length;
      
      const id = addBlock(type, defaultData, insertIdx);
      focusBlock(id);
      setSlashState({ isOpen: false, blockId: null, query: '', position: { top: 0, left: 0 } });
    },
    [blocks, slashState.blockId, addBlock]
  );

  const handleCloseSlashMenu = useCallback(() => {
    if (slashState.blockId) focusBlock(slashState.blockId, true);
    setSlashState({ isOpen: false, blockId: null, query: '', position: { top: 0, left: 0 } });
  }, [slashState.blockId]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 min-h-[calc(100vh-57px)] relative">
      <label className="block mb-6 px-2 text-xs text-text-muted">Document title
        <input aria-label="Document title" value={activeDocument.title} placeholder="Untitled document" onChange={e => useStore.getState().renameDocument(activeDocument.id, e.target.value)} className="block w-full mt-2 bg-transparent text-2xl font-bold text-text-primary outline-none focus-ring rounded p-1" />
      </label>
      {/* ── Block List ── */}
      {blocks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 pl-8 sm:pl-10">
              {blocks.map((block) => (
                <BlockWrapper
                  key={block.id}
                  block={block}
                  onKeyDown={handleBlockKeyDown}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl 
                            bg-bg-tertiary border border-border-default shadow-sm">
              <Layers size={28} className="text-text-primary opacity-80" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
              <Sparkles size={13} />
            </div>
          </div>

          <h2 className="text-lg font-bold text-text-primary mb-2 tracking-tight">
            Start Building Your Canvas
          </h2>
          <p className="text-xs text-text-secondary max-w-md mb-8 leading-relaxed">
            Drag blocks to reorder, customize rich block elements, or type{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[11px] text-text-primary">
              /
            </kbd>{' '}
            anywhere to quickly insert text, code, callouts, and more.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => addBlock('text', '')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white
                         text-xs font-semibold hover:bg-accent-hover active:scale-95
                         transition-all duration-150 shadow-sm focus-ring"
            >
              <Plus size={15} />
              Add Text Block
            </button>

            <button
              onClick={() => addBlock('heading', { text: 'Document Title', level: 1 })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary text-text-secondary
                         border border-border-default text-xs font-semibold hover:text-text-primary
                         hover:border-border-hover active:scale-95 transition-all duration-150 focus-ring"
            >
              <Command size={14} />
              Add Heading
            </button>
          </div>
        </div>
      )}

      {/* ── Add Block Menu ── */}
      <div className="mt-8 pl-8 sm:pl-10">
        <AddBlockMenu />
      </div>

      {/* ── Keyboard Shortcuts Footer ── */}
      <footer className="mt-14 pl-8 sm:pl-10 flex flex-wrap items-center gap-4 text-[11px] text-text-muted border-t border-border-default/50 pt-4">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[10px] text-text-secondary">
            Ctrl+Z
          </kbd>
          Undo
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[10px] text-text-secondary">
            Ctrl+Shift+Z
          </kbd>
          Redo
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[10px] text-text-secondary">
            /
          </kbd>
          Slash Command · Enter: next paragraph · Shift+Enter: new line
        </span>
        <span className="flex items-center gap-1 text-text-muted/70 ml-auto">
          Drag <span className="text-text-primary font-bold">⠿</span> to reorder
        </span>
      </footer>

      {/* ── Slash Command Floating Menu ── */}
      <SlashCommandMenu
        isOpen={slashState.isOpen}
        query={slashState.query}
        onQueryChange={query => setSlashState(s => ({ ...s, query }))}
        onSelect={handleSelectSlashBlock}
        onClose={handleCloseSlashMenu}
        position={slashState.position}
      />
    </main>
  );
};

export default Editor;

