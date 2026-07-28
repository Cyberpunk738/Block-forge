import React from 'react';

/**
 * Format inline markdown markers (**bold**, *italic*, `code`, ~~strike~~, [link](url))
 * into rich React elements for published document preview rendering.
 *
 * @param {string} text - Raw input text with optional markdown markers
 * @returns {React.ReactNode} Formatted React nodes or string
 */
export const formatInlineMarkdown = (text) => {
  if (typeof text !== 'string' || !text) return text;

  // Split by line breaks to preserve multi-line paragraphs cleanly
  const lines = text.split('\n');

  const renderLine = (line, lineIdx) => {
    // RegEx patterns for inline elements:
    // 1. Links: [text](url)
    // 2. Bold: **text** or __text__
    // 3. Italic: *text* or _text_
    // 4. Strikethrough: ~~text~~
    // 5. Code: `text`
    const regex = /(\[.*?\]\(.*?\)|(?:\*\*|__)(.*?)(?:\*\*|__|(?=$))|(?:\*|_)(.*?)(?:\*|_|(?=$))|~~(.*?)~~|`(.*?)`)/g;

    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(line)) !== null) {
      const fullMatch = match[0];
      const matchIndex = match.index;

      // Add plain text before match
      if (matchIndex > lastIndex) {
        parts.push(line.substring(lastIndex, matchIndex));
      }

      // 1. Link [text](url)
      if (fullMatch.startsWith('[') && fullMatch.includes('](')) {
        const linkMatch = fullMatch.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          parts.push(
            <a
              key={key++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-medium hover:opacity-80 transition-opacity"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(fullMatch);
        }
      }
      // 2. Bold **text** or __text__
      else if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
        const boldText = fullMatch.replace(/^(\*\*|__)|(\*\*|__)$/g, '');
        parts.push(
          <strong key={key++} className="font-bold text-text-primary">
            {boldText}
          </strong>
        );
      }
      // 3. Code `text`
      else if (fullMatch.startsWith('`')) {
        const codeText = fullMatch.replace(/^`|`$/g, '');
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-default font-mono text-[0.9em] text-text-primary"
          >
            {codeText}
          </code>
        );
      }
      // 4. Strikethrough ~~text~~
      else if (fullMatch.startsWith('~~')) {
        const strikeText = fullMatch.replace(/^~~|~~$/g, '');
        parts.push(
          <del key={key++} className="line-through text-text-muted">
            {strikeText}
          </del>
        );
      }
      // 5. Italic *text* or _text_
      else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
        const italicText = fullMatch.replace(/^(\*|_)|(\*|_)$/g, '');
        parts.push(
          <em key={key++} className="italic text-text-primary">
            {italicText}
          </em>
        );
      } else {
        parts.push(fullMatch);
      }

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  if (lines.length === 1) {
    return renderLine(lines[0], 0);
  }

  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {renderLine(line, idx)}
      {idx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

export default formatInlineMarkdown;
