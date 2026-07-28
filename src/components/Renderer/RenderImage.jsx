import { memo } from 'react';

/**
 * RenderImage — Renders responsive published images with alt text and rounded corners.
 */
const RenderImage = memo(({ content }) => {
  const url = content?.url || '';
  const alt = content?.alt || 'Document image';

  if (!url) return null;

  return (
    <figure className="my-5 space-y-1.5 overflow-hidden rounded-xl border border-border-default bg-bg-secondary">
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="w-full max-h-[420px] object-cover rounded-xl transition-opacity duration-300"
      />
      {alt && (
        <figcaption className="text-center text-xs text-text-muted italic py-1 px-3">
          {alt}
        </figcaption>
      )}
    </figure>
  );
});

RenderImage.displayName = 'RenderImage';

export default RenderImage;
