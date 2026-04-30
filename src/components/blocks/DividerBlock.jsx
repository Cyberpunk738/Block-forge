/**
 * DividerBlock — Visual horizontal rule / section separator.
 *
 * Content schema: { style: 'solid' | 'dashed' | 'dotted' | 'gradient' }
 *
 * Props:
 * - id: string — Block ID
 * - content: { style: string } — Current divider style
 * - onUpdate: (content: object) => void — Callback to update store
 */

const DIVIDER_STYLES = {
  solid: 'border-t border-border-default',
  dashed: 'border-t border-dashed border-border-default',
  dotted: 'border-t border-dotted border-border-default',
  gradient: '',
};

const STYLE_LABELS = ['solid', 'dashed', 'dotted', 'gradient'];

const DividerBlock = ({ id, content, onUpdate }) => {
  const style = content?.style || 'solid';

  const cycleStyle = () => {
    const currentIdx = STYLE_LABELS.indexOf(style);
    const nextStyle = STYLE_LABELS[(currentIdx + 1) % STYLE_LABELS.length];
    onUpdate({ style: nextStyle });
  };

  return (
    <div className="py-4 group/divider">
      <div className="flex items-center gap-3">
        {/* Divider Line */}
        <div className="flex-1">
          {style === 'gradient' ? (
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)',
              }}
            />
          ) : (
            <hr className={`${DIVIDER_STYLES[style]} m-0`} />
          )}
        </div>

        {/* Style Toggle (visible on hover) */}
        <button
          id={`block-divider-style-${id}`}
          onClick={cycleStyle}
          title={`Style: ${style} — Click to cycle`}
          className="shrink-0 opacity-0 group-hover/divider:opacity-100
                     text-[10px] uppercase tracking-wider font-medium 
                     text-text-muted hover:text-text-secondary
                     px-2 py-1 rounded-md hover:bg-bg-hover 
                     transition-all duration-200"
        >
          {style}
        </button>
      </div>
    </div>
  );
};

export default DividerBlock;
