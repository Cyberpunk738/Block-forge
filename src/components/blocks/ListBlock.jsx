import { useState, useRef, useEffect, useCallback } from 'react';
import { List, ListOrdered, Plus, X } from 'lucide-react';

/**
 * ListBlock — Ordered or unordered list with dynamic items.
 *
 * Content schema: { items: string[], ordered: boolean }
 *
 * Props:
 * - id: string — Block ID
 * - content: { items: string[], ordered: boolean } — Current list data
 * - onUpdate: (content: object) => void — Callback to update store
 */
const ListBlock = ({ id, content, onUpdate }) => {
  const [items, setItems] = useState(content?.items || ['']);
  const [ordered, setOrdered] = useState(content?.ordered || false);
  const debounceRef = useRef(null);
  const itemRefs = useRef([]);
  const focusNextRef = useRef(null);

  // Sync from parent (undo/redo)
  useEffect(() => {
    setItems(content?.items || ['']);
    setOrdered(content?.ordered || false);
  }, [content]);

  // Focus newly created items
  useEffect(() => {
    if (focusNextRef.current !== null) {
      const idx = focusNextRef.current;
      focusNextRef.current = null;
      itemRefs.current[idx]?.focus();
    }
  }, [items]);

  const debouncedUpdate = useCallback((newItems, newOrdered) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ items: newItems, ordered: newOrdered });
    }, 400);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    debouncedUpdate(newItems, ordered);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(index + 1, 0, '');
      setItems(newItems);
      focusNextRef.current = index + 1;
      debouncedUpdate(newItems, ordered);
    }

    if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      focusNextRef.current = Math.max(0, index - 1);
      debouncedUpdate(newItems, ordered);
    }
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    debouncedUpdate(newItems, ordered);
  };

  const addItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    focusNextRef.current = newItems.length - 1;
    debouncedUpdate(newItems, ordered);
  };

  const toggleOrdered = () => {
    const newOrdered = !ordered;
    setOrdered(newOrdered);
    onUpdate({ items, ordered: newOrdered });
  };

  return (
    <div className="space-y-1">
      {/* List Type Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          id={`block-list-toggle-${id}`}
          onClick={toggleOrdered}
          title={ordered ? 'Switch to bullet list' : 'Switch to numbered list'}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                     text-text-muted hover:text-text-primary hover:bg-bg-hover
                     transition-colors duration-150"
        >
          {ordered ? <ListOrdered size={14} /> : <List size={14} />}
          <span>{ordered ? 'Numbered' : 'Bulleted'}</span>
        </button>
      </div>

      {/* List Items */}
      <div className="space-y-0.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 group/item">
            {/* Bullet / Number */}
            <span className="shrink-0 w-6 text-right text-sm text-text-muted font-mono select-none">
              {ordered ? `${index + 1}.` : '•'}
            </span>

            {/* Input */}
            <input
              ref={(el) => (itemRefs.current[index] = el)}
              id={`block-list-item-${id}-${index}`}
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="List item..."
              className="flex-1 bg-transparent text-text-primary placeholder-text-placeholder
                         text-sm border-none outline-none py-1 focus-ring rounded-sm"
            />

            {/* Remove Button */}
            {items.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="shrink-0 opacity-0 group-hover/item:opacity-100 p-1 rounded
                           text-text-muted hover:text-danger hover:bg-danger-subtle
                           transition-all duration-150"
                title="Remove item"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <button
        id={`block-list-add-${id}`}
        onClick={addItem}
        className="flex items-center gap-1.5 mt-2 text-xs text-text-muted hover:text-text-secondary
                   px-2 py-1 rounded-md hover:bg-bg-hover transition-colors duration-150"
      >
        <Plus size={12} />
        <span>Add item</span>
      </button>
    </div>
  );
};

export default ListBlock;
