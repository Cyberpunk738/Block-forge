/**
 * Block Registration Initializer
 *
 * Import this file once at app startup to register all built-in block types.
 * To add a new block type, simply:
 *   1. Create a new component in /blocks
 *   2. Add a registerBlock() call here
 *   3. That's it — the editor picks it up automatically.
 */
import { registerBlock } from './registry';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import HeadingBlock from './HeadingBlock';
import CodeBlock from './CodeBlock';
import QuoteBlock from './QuoteBlock';
import DividerBlock from './DividerBlock';
import ListBlock from './ListBlock';
import CalloutBlock from './CalloutBlock';

// ─── Register Built-in Block Types ────────────────────────

registerBlock('text', {
  component: TextBlock,
  defaultData: '',
  icon: 'Type',
  label: 'Text',
});

registerBlock('heading', {
  component: HeadingBlock,
  defaultData: { text: '', level: 1 },
  icon: 'Heading1',
  label: 'Heading',
});

registerBlock('image', {
  component: ImageBlock,
  defaultData: { url: '', alt: '' },
  icon: 'Image',
  label: 'Image',
});

registerBlock('code', {
  component: CodeBlock,
  defaultData: { code: '', language: 'javascript' },
  icon: 'Code2',
  label: 'Code',
});

registerBlock('quote', {
  component: QuoteBlock,
  defaultData: { text: '', author: '' },
  icon: 'Quote',
  label: 'Quote',
});

registerBlock('list', {
  component: ListBlock,
  defaultData: { items: [''], ordered: false },
  icon: 'List',
  label: 'List',
});

registerBlock('divider', {
  component: DividerBlock,
  defaultData: { style: 'solid' },
  icon: 'Minus',
  label: 'Divider',
});

registerBlock('callout', {
  component: CalloutBlock,
  defaultData: { text: '', variant: 'info' },
  icon: 'Info',
  label: 'Callout',
});
