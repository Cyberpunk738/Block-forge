import { memo } from 'react';

/**
 * RenderDivider — Renders styled horizontal divider rules.
 */
const RenderDivider = memo(({ content }) => {
  const style = content?.style || 'solid';

  const styleClasses = {
    solid: 'border-t border-border-default',
    dashed: 'border-t-2 border-dashed border-border-default',
    dotted: 'border-t-2 border-dotted border-border-default',
    gradient: 'h-px bg-gradient-to-r from-transparent via-border-default to-transparent border-none',
  };

  return <hr className={`my-8 ${styleClasses[style] || styleClasses.solid}`} />;
});

RenderDivider.displayName = 'RenderDivider';

export default RenderDivider;
