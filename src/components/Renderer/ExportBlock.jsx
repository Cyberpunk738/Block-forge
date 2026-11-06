import { createElement } from 'react';
import { formatInlineMarkdown } from '../../utils/formatMarkdown';
import { safeUrl } from '../../utils/safeUrl';

export default function ExportBlock({ block: { type, content: c } }) {
  switch (type) {
    case 'text': return <p>{formatInlineMarkdown(c)}</p>;
    case 'heading': return createElement(`h${c.level}`, null, formatInlineMarkdown(c.text));
    case 'image': return c.url ? <figure><img src={safeUrl(c.url, true)} alt={c.alt} /></figure> : null;
    case 'code': return <pre><code>{c.code}</code></pre>;
    case 'quote': return <blockquote><p>{formatInlineMarkdown(c.text)}</p>{c.author && <cite>{c.author}</cite>}</blockquote>;
    case 'list': return createElement(c.ordered ? 'ol' : 'ul', null, c.items.map((item, i) => <li key={i}>{formatInlineMarkdown(item)}</li>));
    case 'divider': return <hr />;
    case 'callout': return <aside className="callout"><strong>{c.variant.toUpperCase()}</strong><p>{formatInlineMarkdown(c.text)}</p></aside>;
    default: return null;
  }
}

