import { create } from 'zustand';
import { nanoid } from 'nanoid';

// ─── Constants ─────────────────────────────────────────────
const STORAGE_KEY = 'blockforge-blocks';
const MAX_HISTORY = 50;

// ─── Helpers ───────────────────────────────────────────────

/**
 * Load blocks from localStorage.
 * Returns null if nothing is stored or data is invalid.
 */
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Persist blocks array to localStorage.
 */
const saveToStorage = (blocks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch {
    // silently fail — storage might be full
  }
};

/**
 * Deep clone an array (blocks are plain objects, so JSON roundtrip is safe).
 */
const deepClone = (arr) => JSON.parse(JSON.stringify(arr));

// ─── Store ─────────────────────────────────────────────────

const useStore = create((set, get) => ({
  // ── State ──
  blocks: loadFromStorage() || [],
  past: [],
  future: [],

  // ── Internal: push current state to history ──
  _pushToHistory: () => {
    const { blocks, past } = get();
    const newPast = [...past, deepClone(blocks)];
    // Cap history to prevent memory bloat
    if (newPast.length > MAX_HISTORY) newPast.shift();
    set({ past: newPast, future: [] });
  },

  // ── Block Actions ──

  /**
   * Add a new block of the given type with default content.
   * @param {string} type - Block type key (e.g. "text", "image")
   * @param {*} defaultContent - Default content from the registry
   * @param {number} [index] - Optional insertion index (appends if omitted)
   */
  addBlock: (type, defaultContent, index) => {
    const state = get();
    state._pushToHistory();

    const newBlock = {
      id: nanoid(10),
      type,
      content: typeof defaultContent === 'object' && defaultContent !== null
        ? { ...defaultContent }
        : defaultContent,
    };

    const blocks = [...state.blocks];
    if (typeof index === 'number' && index >= 0 && index <= blocks.length) {
      blocks.splice(index, 0, newBlock);
    } else {
      blocks.push(newBlock);
    }

    set({ blocks });
    saveToStorage(blocks);
  },

  /**
   * Update a block's content by ID.
   * @param {string} id - Block ID
   * @param {*} content - New content (merged if object, replaced otherwise)
   */
  updateBlock: (id, content) => {
    const state = get();
    state._pushToHistory();

    const blocks = state.blocks.map((block) => {
      if (block.id !== id) return block;
      // If both old and new content are objects, merge them
      const newContent =
        typeof block.content === 'object' &&
        block.content !== null &&
        typeof content === 'object' &&
        content !== null
          ? { ...block.content, ...content }
          : content;
      return { ...block, content: newContent };
    });

    set({ blocks });
    saveToStorage(blocks);
  },

  /**
   * Delete a block by ID.
   * @param {string} id - Block ID
   */
  deleteBlock: (id) => {
    const state = get();
    state._pushToHistory();

    const blocks = state.blocks.filter((block) => block.id !== id);
    set({ blocks });
    saveToStorage(blocks);
  },

  /**
   * Move a block from one index to another (used by drag-and-drop).
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   */
  moveBlock: (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const state = get();
    state._pushToHistory();

    const blocks = [...state.blocks];
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);

    set({ blocks });
    saveToStorage(blocks);
  },

  // ── Undo / Redo ──

  /**
   * Undo the last action.
   * Moves current state to `future` and restores from `past`.
   */
  undo: () => {
    const { past, blocks, future } = get();
    if (past.length === 0) return;

    const newPast = [...past];
    const previousState = newPast.pop();

    set({
      past: newPast,
      blocks: previousState,
      future: [deepClone(blocks), ...future],
    });

    saveToStorage(previousState);
  },

  /**
   * Redo a previously undone action.
   * Moves current state to `past` and restores from `future`.
   */
  redo: () => {
    const { past, blocks, future } = get();
    if (future.length === 0) return;

    const newFuture = [...future];
    const nextState = newFuture.shift();

    set({
      past: [...past, deepClone(blocks)],
      blocks: nextState,
      future: newFuture,
    });

    saveToStorage(nextState);
  },

  /**
   * Check if undo is available.
   */
  canUndo: () => get().past.length > 0,

  /**
   * Check if redo is available.
   */
  canRedo: () => get().future.length > 0,

  /**
   * Clear all blocks and history.
   */
  clearAll: () => {
    const state = get();
    if (state.blocks.length > 0) {
      state._pushToHistory();
    }
    set({ blocks: [] });
    saveToStorage([]);
  },
}));

export default useStore;
