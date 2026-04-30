import { useState, useRef, useEffect, useCallback } from 'react';
import { Code2, Copy, Check, ChevronDown } from 'lucide-react';

/**
 * CodeBlock — Monospace code editor with language selector.
 *
 * Content schema: { code: string, language: string }
 *
 * Props:
 * - id: string — Block ID
 * - content: { code: string, language: string } — Current code data
 * - onUpdate: (content: object) => void — Callback to update store
 */

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'html', 'css', 'json',
  'bash', 'sql', 'rust', 'go', 'java', 'c', 'cpp', 'ruby', 'php', 'plain',
];

const CodeBlock = ({ id, content, onUpdate }) => {
  const [code, setCode] = useState(content?.code || '');
  const [language, setLanguage] = useState(content?.language || 'javascript');
  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const langMenuRef = useRef(null);

  // Sync from parent (undo/redo)
  useEffect(() => {
    setCode(content?.code || '');
    setLanguage(content?.language || 'javascript');
  }, [content]);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 72)}px`;
    }
  }, [code]);

  // Close lang menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLangMenu]);

  const debouncedUpdate = useCallback((newCode, newLang) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ code: newCode, language: newLang });
    }, 400);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    debouncedUpdate(newCode, language);
  };

  // Allow Tab key inside textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      debouncedUpdate(newCode, language);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      });
    }
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setShowLangMenu(false);
    onUpdate({ code, language: lang });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="rounded-lg overflow-hidden border border-border-default bg-bg-tertiary">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-tertiary border-b border-border-default">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-accent" />

          {/* Language Selector */}
          <div ref={langMenuRef} className="relative">
            <button
              id={`block-code-lang-${id}`}
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 text-xs font-mono text-text-secondary 
                         hover:text-text-primary px-1.5 py-0.5 rounded
                         hover:bg-bg-hover transition-colors duration-150"
            >
              {language}
              <ChevronDown size={12} />
            </button>

            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 max-h-48 overflow-y-auto
                              bg-bg-secondary border border-border-default rounded-lg shadow-xl shadow-black/40
                              py-1 z-50"
                   style={{ animation: 'blockSlideIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangChange(lang)}
                    className={`block w-full text-left px-3 py-1.5 text-xs font-mono
                                transition-colors duration-100
                                ${lang === language
                                  ? 'text-accent bg-accent-subtle'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                                }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <button
          id={`block-code-copy-${id}`}
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary
                     px-2 py-1 rounded hover:bg-bg-hover transition-colors duration-150"
          title="Copy code"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Area */}
      <div className="flex">
        {/* Line Numbers */}
        <div className="select-none text-right text-[11px] font-mono text-text-muted/50 py-3 pl-3 pr-2 leading-[1.7]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={`block-code-editor-${id}`}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          placeholder="// Write your code here..."
          spellCheck={false}
          className="w-full bg-transparent text-text-primary placeholder-text-placeholder
                     font-mono text-sm leading-[1.7] resize-none border-none outline-none 
                     py-3 pr-3 min-h-[72px]"
        />
      </div>
    </div>
  );
};

export default CodeBlock;
