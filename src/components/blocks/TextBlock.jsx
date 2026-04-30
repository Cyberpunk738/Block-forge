import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * TextBlock — Editable paragraph block.
 *
 * Props:
 * - id: string — Block ID
 * - content: string — Current text content
 * - onUpdate: (content: string) => void — Callback to update store
 */
const TextBlock = ({ id, content, onUpdate }) => {
  const [localValue, setLocalValue] = useState(content);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync from parent when content changes externally (undo/redo)
  useEffect(() => {
    setLocalValue(content);
  }, [content]);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [localValue]);

  // Debounced update to store (avoids pushing history on every keystroke)
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setLocalValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(value);
    }, 400);
  }, [onUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="group/text">
      <textarea
        ref={textareaRef}
        id={`block-text-${id}`}
        value={localValue}
        onChange={handleChange}
        placeholder="Start typing..."
        rows={1}
        className="w-full bg-transparent text-text-primary placeholder-text-placeholder 
                   text-base leading-relaxed resize-none border-none outline-none 
                   py-1 px-0 focus-ring rounded-sm"
        spellCheck={true}
      />
    </div>
  );
};

export default TextBlock;
