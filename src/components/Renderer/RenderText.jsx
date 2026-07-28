import { memo } from 'react';

/**
 * RenderText — Renders text/paragraph blocks for published output.
 * Preserves line breaks and paragraph spacing without editing inputs.
 */
const RenderText = memo(({ content }) => {
  const text = typeof content === 'string' ? content : content?.text || '';

  if (!text.trim()) return null;

  return (
    <p className="text-base leading-relaxed text-text-primary whitespace-pre-wrap my-3 font-normal">
      {text}
    </p>
  );
});

RenderText.displayName = 'RenderText';

export default RenderText;
