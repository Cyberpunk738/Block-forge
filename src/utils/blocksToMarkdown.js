export const blocksToMarkdown = (blocks) => {
  return blocks.map((block) => {
    switch (block.type) {
      case 'heading': {
        const level = block.content?.level || 1;
        const prefix = '#'.repeat(Math.min(level, 6));
        return `${prefix} ${block.content?.text || ''}`;
      }
      case 'text':
        return typeof block.content === 'string' ? block.content : '';
      case 'image': {
        const alt = block.content?.alt || 'Image';
        const url = block.content?.url || '';
        return url ? `![${alt}](${url})` : '';
      }
      case 'code': {
        const lang = block.content?.language || '';
        const code = block.content?.code || '';
        const runs = code.match(/`+/g) || [];
        const fence = '`'.repeat(Math.max(3, ...runs.map(run => run.length + 1)));
        return `${fence}${lang}\n${code}\n${fence}`;
      }
      case 'quote': {
        const text = block.content?.text || '';
        const author = block.content?.author;
        const lines = text.split('\n').map((l) => `> ${l}`).join('\n');
        return author ? `${lines}\n> — *${author}*` : lines;
      }
      case 'list': {
        const items = block.content?.items || [];
        const ordered = block.content?.ordered || false;
        return items.map((item, i) =>
          ordered ? `${i + 1}. ${item}` : `- ${item}`
        ).join('\n');
      }
      case 'divider':
        return '---';
      case 'callout': {
        const variant = (block.content?.variant || 'info').toUpperCase();
        const text = block.content?.text || '';
        return `> **${variant}:** ${text}`;
      }
      default:
        return `<!-- Unknown block type: ${block.type} -->`;
    }
  }).join('\n\n');
};

