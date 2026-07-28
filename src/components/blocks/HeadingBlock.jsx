import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * HeadingBlock — Editable heading with level selector (h1–h3).
 *
 * Content schema: { text: string, level: 1 | 2 | 3 }
 *
 * Props:
 * - id: string — Block ID
 * - content: { text: string, level: number } — Current heading data
 * - onUpdate: (content: object) => void — Callback to update store
 * - onKeyDown: (e: React.KeyboardEvent) => void — Keyboard handler
 */

const LEVEL_STYLES = {
  1: 'text-3xl font-bold tracking-tight',
  2: 'text-2xl font-semibold tracking-tight',
  3: 'text-xl font-medium tracking-tight',
};

const HeadingBlock = ({ id, content, onUpdate, onKeyDown }) => {
  const [text, setText] = useState(content?.text || '');
  const [level, setLevel] = useState(content?.level || 1);
  const [prevContent, setPrevContent] = useState(content);

  // Sync state during render when content prop changes (e.g. undo/redo)
  if (content !== prevContent) {
    setPrevContent(content);
    setText(content?.text || '');
    setLevel(content?.level || 1);
  }

  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const debouncedUpdate = useCallback((newText, newLevel) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ text: newText, level: newLevel });
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
    debouncedUpdate(newText, level);
  };

  const cycleLevel = () => {
    const newLevel = level >= 3 ? 1 : level + 1;
    setLevel(newLevel);
    onUpdate({ text, level: newLevel });
  };

  return (
    <div className="flex items-start gap-3">
      {/* Level Toggle Button */}
      <button
        id={`block-heading-level-${id}`}
        onClick={cycleLevel}
        title={`Heading ${level} — Click to cycle`}
        aria-label={`Cycle heading level, currently H${level}`}
        className="shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-lg
                   bg-accent-subtle text-accent hover:bg-bg-hover active:scale-95
                   transition-all duration-150 text-xs font-bold focus-ring"
      >
        H{level}
      </button>

      {/* Heading Input */}
      <input
        ref={inputRef}
        id={`block-heading-text-${id}`}
        type="text"
        value={text}
        onChange={handleTextChange}
        onKeyDown={onKeyDown}
        placeholder="Heading..."
        className={`w-full bg-transparent text-text-primary placeholder-text-placeholder
                    border-none outline-none py-1 focus-ring rounded-sm transition-all duration-150
                    ${LEVEL_STYLES[level] || LEVEL_STYLES[1]}`}
      />
    </div>
  );
};

export default HeadingBlock;

