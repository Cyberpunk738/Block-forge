import { nanoid } from 'nanoid';

/**
 * Parse a markdown string into an array of block objects suitable for the store.
 */
export function markdownToBlocks(md) {
  const result = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      result.push({
        id: nanoid(10),
        type: 'code',
        content: { code: codeLines.join('\n'), language: lang || 'javascript' },
      });
      continue;
    }

    // Thematic break
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      result.push({
        id: nanoid(10),
        type: 'divider',
        content: { style: 'solid' },
      });
      i++;
      continue;
    }

    // ATX heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      result.push({
        id: nanoid(10),
        type: 'heading',
        content: { text, level },
      });
      i++;
      continue;
    }

    // Blockquote — merge consecutive quote lines
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      result.push({
        id: nanoid(10),
        type: 'quote',
        content: { text: quoteLines.join('\n'), author: '' },
      });
      continue;
    }

    // Unordered or ordered list — merge consecutive items
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const ordered = !!olMatch;
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const um = l.match(/^[-*+]\s+(.+)$/);
        const om = l.match(/^\d+\.\s+(.+)$/);
        if (ordered ? om : um) {
          items.push(ordered ? om[1].trim() : um[1].trim());
          i++;
        } else break;
      }
      result.push({
        id: nanoid(10),
        type: 'list',
        content: { items, ordered },
      });
      continue;
    }

    // Image
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      result.push({
        id: nanoid(10),
        type: 'image',
        content: { url: imgMatch[2], alt: imgMatch[1] },
      });
      i++;
      continue;
    }

    // Paragraph (one or more non-empty lines)
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '') {
      paraLines.push(lines[i]);
      i++;
    }
    result.push({
      id: nanoid(10),
      type: 'text',
      content: paraLines.join('\n'),
    });
  }

  return result;
}
