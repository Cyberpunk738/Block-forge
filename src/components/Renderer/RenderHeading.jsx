import { memo } from 'react';
import formatInlineMarkdown from '../../utils/formatMarkdown';

/**
 * RenderHeading — Renders semantic H1, H2, or H3 headings.
 */
const RenderHeading = memo(({ content }) => {
  const text = typeof content === 'object' && content !== null ? content.text : String(content || '');
  const level = typeof content === 'object' && content !== null ? content.level || 1 : 1;

  if (!text.trim()) return null;

  const formattedText = formatInlineMarkdown(text);

  switch (level) {
    case 1:
      return (
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-6 mb-3 leading-tight">
          {formattedText}
        </h1>
      );
    case 2:
      return (
        <h2 className="text-2xl font-bold text-text-primary tracking-tight mt-5 mb-2.5 leading-snug">
          {formattedText}
        </h2>
      );
    case 3:
    default:
      return (
        <h3 className="text-xl font-semibold text-text-primary tracking-tight mt-4 mb-2 leading-snug">
          {formattedText}
        </h3>
      );
  }
});

RenderHeading.displayName = 'RenderHeading';

export default RenderHeading;

