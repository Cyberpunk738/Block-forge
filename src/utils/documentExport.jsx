import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ExportBlock from '../components/Renderer/ExportBlock';

export { downloadFile } from './downloadFile';

export function blocksToHtml(blocks, title = 'Untitled document') {
  const heading = renderToStaticMarkup(createElement('title', null, title));
  const body = renderToStaticMarkup(createElement('article', null, blocks.map(block => createElement(ExportBlock, { key: block.id, block }))));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${heading}<style>
body{font:16px/1.7 system-ui,sans-serif;color:#171717;background:#fff;margin:0}article{max-width:760px;margin:48px auto;padding:0 24px}h1,h2,h3,h4,h5,h6{line-height:1.2;margin:1.4em 0 .5em}p{white-space:pre-wrap}img{max-width:100%;height:auto}pre{background:#f5f5f5;padding:16px;overflow:auto;white-space:pre-wrap;border-radius:8px}code{font-family:monospace}blockquote{border-left:3px solid #bbb;margin:20px 0;padding-left:20px}a{color:#1754b9}button{display:none}ul{list-style:disc}ol{list-style:decimal}hr{border:0;border-top:1px solid #bbb;margin:24px 0}figure{margin:24px 0}.callout{border:1px solid #ccc;border-radius:8px;padding:16px;margin:20px 0;background:#fafafa}.callout p{margin:4px 0}
@media print{@page{margin:18mm}article{margin:0;max-width:none;padding:0}pre,figure,blockquote{break-inside:avoid}h1,h2,h3{break-after:avoid}a{color:inherit}body{font-size:11pt}}
</style></head><body>${body}</body></html>`;
}
