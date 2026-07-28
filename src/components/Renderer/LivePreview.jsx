import { memo } from 'react';
import useStore from '../../store/useStore';
import BlockRenderer from './BlockRenderer';
import { FileText } from 'lucide-react';

/**
 * LivePreview — Published document rendering side panel.
 *
 * Consumes the Zustand store blocks state directly and renders the final document.
 * Contains zero editing controls or chrome.
 */
const LivePreview = memo(() => {
  const blocks = useStore((s) => s.blocks);

  // Check if document has non-empty blocks
  const hasContent = blocks.some((b) => {
    if (!b.content) return false;
    if (typeof b.content === 'string') return b.content.trim().length > 0;
    if (typeof b.content === 'object') {
      if (b.type === 'heading' || b.type === 'quote' || b.type === 'callout') return Boolean(b.content.text?.trim());
      if (b.type === 'code') return Boolean(b.content.code?.trim());
      if (b.type === 'image') return Boolean(b.content.url?.trim());
      if (b.type === 'list') return Array.isArray(b.content.items) && b.content.items.some((i) => i.trim());
      if (b.type === 'divider') return true;
    }
    return true;
  });

  return (
    <section
      aria-label="Live Preview Panel"
      className="flex flex-col h-full bg-bg-primary border-l border-border-default/80 overflow-hidden"
    >
      {/* ── Preview Header ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border-default bg-bg-secondary/60 shrink-0 select-none">
        <div>
          <h2 className="text-sm font-bold text-text-primary tracking-tight leading-none">
            Live Preview
          </h2>
          <span className="text-[11px] text-text-muted leading-tight">
            Rendering current document
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>✓ Live</span>
        </div>
      </div>

      {/* ── Preview Body ── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8">
        {hasContent ? (
          <article className="max-w-2xl mx-auto space-y-2 text-text-primary font-sans antialiased">
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </article>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center py-16">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-tertiary border border-border-default mb-4 text-text-muted">
              <FileText size={26} />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Nothing to preview yet
            </h3>
            <p className="text-xs text-text-muted max-w-xs leading-relaxed">
              Start adding blocks in the editor to see the rendered document update in real time.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;
