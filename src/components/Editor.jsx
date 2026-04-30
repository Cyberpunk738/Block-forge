import { useCallback, useMemo } from 'react';
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
import { Layers } from 'lucide-react';

/**
 * Editor — Main editor surface.
 *
 * Renders the block list inside a DnD context with vertical sortable.
 * Blocks are resolved and wrapped by BlockWrapper.
 */
const Editor = () => {
  const blocks = useStore((s) => s.blocks);
  const moveBlock = useStore((s) => s.moveBlock);

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-[calc(100vh-57px)]">
      {/* ── Block List ── */}
      {blocks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pl-10">
              {blocks.map((block) => (
                <BlockWrapper key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl 
                          bg-accent-subtle mb-6">
            <Layers size={32} className="text-accent opacity-60" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No blocks yet
          </h2>
          <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
            Start building your document by adding blocks below. 
            Each block is an independent, reorderable unit.
          </p>
        </div>
      )}

      {/* ── Add Block Menu ── */}
      <div className="mt-6 pl-10">
        <AddBlockMenu />
      </div>

      {/* ── Keyboard Shortcut Hint ── */}
      <div className="mt-12 pl-10 flex items-center gap-4 text-[11px] text-text-muted">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[10px]">
            Ctrl+Z
          </kbd>{' '}
          Undo
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[10px]">
            Ctrl+Shift+Z
          </kbd>{' '}
          Redo
        </span>
        <span>
          Drag <span className="text-text-placeholder">⠿</span> to reorder
        </span>
      </div>
    </div>
  );
};

export default Editor;
