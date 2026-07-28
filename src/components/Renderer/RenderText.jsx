import { memo } from 'react';
import formatInlineMarkdown from '../../utils/formatMarkdown';

/**
 * RenderText — Renders text/paragraph blocks for published output.
 * Formats inline markdown (**bold**, *italic*, `code`, [link](url)).
 */
const RenderText = memo(({ content }) => {
  const text = typeof content === 'string' ? content : content?.text || '';

  if (!text.trim()) return null;

  return (
    <p className="text-base leading-relaxed text-text-primary my-3 font-normal">
      {formatInlineMarkdown(text)}
    </p>
  );
});

RenderText.displayName = 'RenderText';

export default RenderText;

