import { memo } from 'react';

/**
 * RenderList — Renders ordered <ol> or unordered <ul> list elements.
 */
const RenderList = memo(({ content }) => {
  const items = Array.isArray(content?.items) ? content.items : [];
  const ordered = Boolean(content?.ordered);

  const nonKeys = items.filter((item) => typeof item === 'string' && item.trim() !== '');

  if (nonKeys.length === 0) return null;

  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag
      className={`my-4 pl-6 space-y-1.5 text-text-primary text-base leading-relaxed ${
        ordered ? 'list-decimal' : 'list-disc'
      }`}
    >
      {items.map((item, index) => {
        if (!item || !item.trim()) return null;
        return <li key={index}>{item}</li>;
      })}
    </ListTag>
  );
});

RenderList.displayName = 'RenderList';

export default RenderList;
