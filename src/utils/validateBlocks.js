const string = (value) => typeof value === 'string';
export function validateBlocks(blocks) {
  if (!Array.isArray(blocks)) throw new Error('Expected an array of blocks.');
  const ids = new Set();
  blocks.forEach((b, i) => {
    const fail = message => { throw new Error(`Block ${i + 1}: ${message}`); };
    if (!b || !string(b.id) || !b.id.trim()) fail('a non-empty id is required.');
    if (ids.has(b.id)) fail('duplicate id.');
    ids.add(b.id);
    const c = b.content;
    if (b.type === 'text') { if (!string(c)) fail('text must be a string.'); return; }
    if (!c || typeof c !== 'object' || Array.isArray(c)) fail('content must be an object.');
    switch (b.type) {
      case 'heading': if (!string(c.text) || !Number.isInteger(c.level) || c.level < 1 || c.level > 6) fail('heading needs text and a level from 1 to 6.'); break;
      case 'image': if (!string(c.url) || !string(c.alt)) fail('image needs url and alt strings.'); break;
      case 'code': if (!string(c.code) || !string(c.language)) fail('code needs code and language strings.'); break;
      case 'quote': if (!string(c.text) || !string(c.author)) fail('quote needs text and author strings.'); break;
      case 'list': if (!Array.isArray(c.items) || !c.items.every(string) || typeof c.ordered !== 'boolean') fail('list needs string items and an ordered flag.'); break;
      case 'divider': if (!['solid','dashed','dotted','gradient'].includes(c.style)) fail('invalid divider style.'); break;
      case 'callout': if (!string(c.text) || !['info','warning','success','error'].includes(c.variant)) fail('invalid callout text or variant.'); break;
      default: fail(`unsupported type "${b.type}".`);
    }
  });
  return blocks;
}
