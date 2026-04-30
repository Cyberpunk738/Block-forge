import { useState, useRef, useEffect, useCallback } from 'react';
import { Quote } from 'lucide-react';

/**
 * QuoteBlock — Styled blockquote with optional attribution.
 *
 * Content schema: { text: string, author: string }
 *
 * Props:
 * - id: string — Block ID
 * - content: { text: string, author: string } — Current quote data
 * - onUpdate: (content: object) => void — Callback to update store
 */
const QuoteBlock = ({ id, content, onUpdate }) => {
  const [text, setText] = useState(content?.text || '');
  const [author, setAuthor] = useState(content?.author || '');
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync from parent (undo/redo)
  useEffect(() => {
    setText(content?.text || '');
    setAuthor(content?.author || '');
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  const debouncedUpdate = useCallback((newText, newAuthor) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ text: newText, author: newAuthor });
    }, 400);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    debouncedUpdate(newText, author);
  };

  const handleAuthorChange = (e) => {
    const newAuthor = e.target.value;
    setAuthor(newAuthor);
    debouncedUpdate(text, newAuthor);
  };

  return (
    <div className="relative pl-4 border-l-[3px] border-accent/60">
      {/* Quote Icon */}
      <div className="absolute -left-[13px] -top-1 bg-bg-secondary p-0.5">
        <Quote size={14} className="text-accent/50" />
      </div>

      {/* Quote Text */}
      <textarea
        ref={textareaRef}
        id={`block-quote-text-${id}`}
        value={text}
        onChange={handleTextChange}
        placeholder="Write a quote..."
        rows={1}
        className="w-full bg-transparent text-text-primary placeholder-text-placeholder
                   text-base italic leading-relaxed resize-none border-none outline-none
                   py-1 px-0 focus-ring rounded-sm"
        spellCheck={true}
      />

      {/* Author Attribution */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-text-muted text-sm">—</span>
        <input
          id={`block-quote-author-${id}`}
          type="text"
          value={author}
          onChange={handleAuthorChange}
          placeholder="Author (optional)"
          className="bg-transparent text-text-secondary placeholder-text-placeholder
                     text-sm border-none outline-none py-0.5 focus-ring rounded-sm"
        />
      </div>
    </div>
  );
};

export default QuoteBlock;
