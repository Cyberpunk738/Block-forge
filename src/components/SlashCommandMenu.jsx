import { useState, useEffect, useRef } from 'react';
import {
  Type, Image, Heading1, Square,
  Code2, Quote, Minus, List, Info, Search, Sparkles
} from 'lucide-react';
import { getBlockTypes } from './blocks/registry';

const ICON_MAP = {
  Type,
  Image,
  Heading1,
  Square,
  Code2,
  Quote,
  Minus,
  List,
  Info,
};

const BLOCK_DESCRIPTIONS = {
  text: 'Plain text paragraph for body copy',
  heading: 'Heading level 1, 2, or 3',
  image: 'Embed an image with URL and alt text',
  code: 'Monospace code block with syntax options',
  quote: 'Blockquote with optional author source',
  list: 'Bulleted or numbered item list',
  divider: 'Visual divider line',
  callout: 'Alert container for info, warning, success',
};

/**
 * SlashCommandMenu — Floating inline palette triggered by typing '/'.
 * Allows quick searching and insertion/conversion of blocks via keyboard.
 */
const SlashCommandMenu = ({ isOpen, query = '', onSelect, onClose, position }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const blockTypes = getBlockTypes();
  const filtered = blockTypes.filter(({ type, label }) => {
    const q = query.toLowerCase().trim();
    return (
      type.toLowerCase().includes(q) ||
      label.toLowerCase().includes(q) ||
      (BLOCK_DESCRIPTIONS[type] && BLOCK_DESCRIPTIONS[type].toLowerCase().includes(q))
    );
  });

  const [prevQuery, setPrevQuery] = useState(query);

  // Reset index during render when query changes
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  // Handle keyboard events (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type, filtered[selectedIndex].defaultData);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Slash commands"
      style={{
        top: position?.top ? `${position.top}px` : 'auto',
        left: position?.left ? `${position.left}px` : 'auto',
        animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      className="absolute z-50 w-72 max-h-80 overflow-hidden rounded-xl border border-border-default 
                 bg-bg-primary shadow-2xl shadow-black/15 flex flex-col"
    >
      {/* Header / Search hint */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-default bg-bg-secondary/70">
        <Sparkles size={14} className="text-accent/70" />
        <span className="text-xs font-medium text-text-secondary">
          {query ? `Matching "${query}"` : 'Basic Blocks'}
        </span>
        <span className="ml-auto text-[10px] text-text-muted font-mono bg-bg-tertiary px-1.5 py-0.5 rounded">
          ESC to cancel
        </span>
      </div>

      {/* Block options list */}
      <div className="overflow-y-auto py-1 flex-1">
        {filtered.length > 0 ? (
          filtered.map(({ type, label, icon, defaultData }, index) => {
            const IconComponent = ICON_MAP[icon] || Square;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={type}
                id={`slash-option-${type}`}
                role="menuitem"
                aria-selected={isSelected}
                onClick={() => onSelect(type, defaultData)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-start gap-3 w-full px-3 py-2 text-left transition-colors duration-100
                            ${isSelected
                              ? 'bg-bg-tertiary text-text-primary'
                              : 'text-text-secondary hover:bg-bg-hover'
                            }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5
                             ${isSelected ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-muted'}`}
                >
                  <IconComponent size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold block text-text-primary">
                      {label}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted capitalize">
                      /{type}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted line-clamp-1 block leading-tight">
                    {BLOCK_DESCRIPTIONS[type] || `${type} block`}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <Search size={20} className="text-text-muted mb-2 opacity-50" />
            <p className="text-xs font-medium text-text-secondary">No matching blocks</p>
            <p className="text-[11px] text-text-muted">Try typing /text, /code, /image...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlashCommandMenu;
