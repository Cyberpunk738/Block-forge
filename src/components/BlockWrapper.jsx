import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { getBlock } from './blocks/registry';
import useStore from '../store/useStore';

/**
 * BlockWrapper — Chrome layer around every block.
 *
 * Responsibilities:
 * - Resolves the correct component from the registry
 * - Provides drag handle via dnd-kit's useSortable
 * - Renders action toolbar (delete, duplicate)
 * - Passes onUpdate callback wired to the store
 *
 * Props:
 * - block: { id, type, content } — The block data
 */
const BlockWrapper = memo(({ block }) => {
  const updateBlock = useStore((s) => s.updateBlock);
  const deleteBlock = useStore((s) => s.deleteBlock);
  const addBlock = useStore((s) => s.addBlock);
  const blocks = useStore((s) => s.blocks);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Resolve component from registry
  const blockConfig = getBlock(block.type);

  const handleUpdate = useCallback(
    (content) => updateBlock(block.id, content),
    [block.id, updateBlock]
  );

  const handleDelete = useCallback(
    () => deleteBlock(block.id),
    [block.id, deleteBlock]
  );

  const handleDuplicate = useCallback(() => {
    const currentIndex = blocks.findIndex((b) => b.id === block.id);
    const defaultData =
      typeof block.content === 'object' && block.content !== null
        ? { ...block.content }
        : block.content;
    addBlock(block.type, defaultData, currentIndex + 1);
  }, [block, blocks, addBlock]);

  // Fallback if block type is not registered
  if (!blockConfig) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border border-danger/30 bg-danger-subtle px-4 py-3"
      >
        <span className="text-sm text-danger">
          Unknown block type: <code className="font-mono">"{block.type}"</code>
        </span>
      </div>
    );
  }

  const BlockComponent = blockConfig.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`block-${block.id}`}
      className={`group relative rounded-xl border transition-all duration-200
                  ${isDragging
                    ? 'border-accent bg-bg-active shadow-lg shadow-accent/5 z-50 opacity-50'
                    : 'border-transparent hover:border-border-default bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
    >
      {/* ── Block Chrome (visible on hover) ── */}
      <div
        className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded-md text-text-muted hover:text-text-secondary 
                     hover:bg-bg-hover cursor-grab active:cursor-grabbing
                     transition-colors duration-150"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {/* ── Action Toolbar (top-right, visible on hover) ── */}
      <div
        className="absolute -top-3 right-3 flex items-center gap-1 
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    translate-y-1 group-hover:translate-y-0"
      >
        <button
          id={`block-duplicate-${block.id}`}
          onClick={handleDuplicate}
          className="p-1.5 rounded-lg bg-bg-tertiary border border-border-default
                     text-text-muted hover:text-text-primary hover:border-border-hover
                     hover:bg-bg-hover transition-all duration-150"
          title="Duplicate block"
          aria-label="Duplicate block"
        >
          <Copy size={13} />
        </button>
        <button
          id={`block-delete-${block.id}`}
          onClick={handleDelete}
          className="p-1.5 rounded-lg bg-bg-tertiary border border-border-default
                     text-text-muted hover:text-danger hover:border-danger/30
                     hover:bg-danger-subtle transition-all duration-150"
          title="Delete block"
          aria-label="Delete block"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Block Content ── */}
      <div className="px-4 py-3">
        <BlockComponent
          id={block.id}
          content={block.content}
          onUpdate={handleUpdate}
        />
      </div>

      {/* ── Block Type Badge (bottom-right, subtle) ── */}
      <div
        className="absolute bottom-1.5 right-3 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200"
      >
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          {block.type}
        </span>
      </div>
    </div>
  );
});

BlockWrapper.displayName = 'BlockWrapper';

export default BlockWrapper;
