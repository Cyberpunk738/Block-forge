import { memo } from 'react';
import formatInlineMarkdown from '../../utils/formatMarkdown';

/**
 * RenderQuote — Renders elegant blockquotes with author attribution.
 */
const RenderQuote = memo(({ content }) => {
  const text = content?.text || (typeof content === 'string' ? content : '');
  const author = content?.author || '';

  if (!text.trim()) return null;

  return (
    <blockquote className="my-5 pl-5 border-l-4 border-accent/80 italic text-text-primary space-y-2 bg-bg-secondary/40 py-2 rounded-r-lg">
      <p className="text-base leading-relaxed">{formatInlineMarkdown(text)}</p>
      {author && (
        <cite className="block text-xs font-semibold not-italic text-text-secondary">
          — {formatInlineMarkdown(author)}
        </cite>
      )}
    </blockquote>
  );
});

RenderQuote.displayName = 'RenderQuote';

export default RenderQuote;

