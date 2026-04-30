/**
 * BlockForge — Block Registry
 *
 * Central registry that maps block type keys to their configuration.
 * The editor reads from this registry to render blocks and populate
 * the "Add Block" menu. New block types are added here — zero editor changes needed.
 *
 * Registry Entry Schema:
 * {
 *   component: React.ComponentType,   // The block render component
 *   defaultData: any,                 // Default content for new blocks of this type
 *   icon: string,                     // Lucide icon name (used in AddBlockMenu)
 *   label: string,                    // Human-readable label
 * }
 */

// ─── Internal Registry Map ────────────────────────────────

const blockRegistry = {};

// ─── Public API ───────────────────────────────────────────

/**
 * Register a new block type.
 * @param {string} type - Unique key for the block type (e.g. "text", "image")
 * @param {object} config - Block configuration
 * @param {React.ComponentType} config.component - React component to render
 * @param {*} config.defaultData - Default content for new blocks
 * @param {string} config.icon - Icon identifier
 * @param {string} config.label - Display label
 */
export const registerBlock = (type, config) => {
  if (blockRegistry[type]) {
    console.warn(`[BlockForge] Block type "${type}" is already registered. Overwriting.`);
  }

  if (!config.component) {
    throw new Error(`[BlockForge] Cannot register block type "${type}" without a component.`);
  }

  blockRegistry[type] = {
    component: config.component,
    defaultData: config.defaultData ?? '',
    icon: config.icon ?? 'Square',
    label: config.label ?? type,
  };
};

/**
 * Get the configuration for a registered block type.
 * @param {string} type - Block type key
 * @returns {object|null} The block config or null if not found
 */
export const getBlock = (type) => {
  return blockRegistry[type] || null;
};

/**
 * Get all registered block types as an array of { type, ...config }.
 * Used to populate the "Add Block" menu.
 * @returns {Array<{ type: string, component: React.ComponentType, defaultData: any, icon: string, label: string }>}
 */
export const getBlockTypes = () => {
  return Object.entries(blockRegistry).map(([type, config]) => ({
    type,
    ...config,
  }));
};

/**
 * Check if a block type is registered.
 * @param {string} type
 * @returns {boolean}
 */
export const hasBlock = (type) => {
  return type in blockRegistry;
};

export default blockRegistry;
