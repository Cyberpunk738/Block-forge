import { useState, useRef, useEffect } from 'react';
import {
  Plus, Type, Image, Heading1, Square,
  Code2, Quote, Minus, List, Info,
} from 'lucide-react';
import { getBlockTypes } from './blocks/registry';
import useStore from '../store/useStore';

/**
 * Icon map: registry icon names → Lucide components.
 * Extend this as you add new block types.
 */
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

/**
 * AddBlockMenu — Dropdown to insert new block types.
 *
 * Reads available block types from the registry dynamically,
 * so new types appear automatically once registered.
 */
const AddBlockMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const addBlock = useStore((s) => s.addBlock);

  const blockTypes = getBlockTypes();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleAdd = (type, defaultData) => {
    const data =
      typeof defaultData === 'object' && defaultData !== null
        ? { ...defaultData }
        : defaultData;
    addBlock(type, data);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        id="add-block-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                   border border-dashed border-border-default
                   text-text-muted hover:text-text-primary hover:border-border-hover
                   hover:bg-bg-tertiary transition-all duration-200 group"
      >
        <Plus
          size={18}
          className="transition-transform duration-200 group-hover:rotate-90"
        />
        <span className="text-sm font-medium">Add Block</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-64 rounded-xl 
                      bg-bg-secondary border border-border-default shadow-2xl shadow-black/40
                      py-1.5 z-50"
          style={{ animation: 'blockSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <div className="px-3 py-2 border-b border-border-default">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Block Types
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {blockTypes.map(({ type, label, icon, defaultData }) => {
              const IconComponent = ICON_MAP[icon] || Square;
              return (
                <button
                  key={type}
                  id={`add-block-${type}`}
                  onClick={() => handleAdd(type, defaultData)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left
                             text-text-secondary hover:text-text-primary hover:bg-bg-hover
                             transition-colors duration-150"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-subtle">
                    <IconComponent size={16} className="text-accent" />
                  </div>
                  <div>
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-[11px] text-text-muted">{type} block</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBlockMenu;
