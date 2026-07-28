import { memo } from 'react';
import RenderText from './RenderText';
import RenderHeading from './RenderHeading';
import RenderImage from './RenderImage';
import RenderCode from './RenderCode';
import RenderQuote from './RenderQuote';
import RenderDivider from './RenderDivider';
import RenderList from './RenderList';
import RenderCallout from './RenderCallout';

const RENDERER_MAP = {
  text: RenderText,
  heading: RenderHeading,
  image: RenderImage,
  code: RenderCode,
  quote: RenderQuote,
  divider: RenderDivider,
  list: RenderList,
  callout: RenderCallout,
};

/**
 * BlockRenderer — Main block renderer dispatcher.
 * Takes a raw block data object and renders its published representation.
 */
const BlockRenderer = memo(({ block }) => {
  if (!block || !block.type) return null;

  const Component = RENDERER_MAP[block.type];

  if (!Component) {
    return null;
  }

  return <Component content={block.content} />;
});

BlockRenderer.displayName = 'BlockRenderer';

export default BlockRenderer;
