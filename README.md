# 🧱 BlockForge

A modern, modular block-based editor built with React. Create structured documents by composing independent, drag-and-drop reorderable blocks — from text and headings to code snippets, callouts, and more.

![BlockForge](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

##  Features

- **8 Block Types** — Text, Heading (H1–H3), Image, Code, Quote, List, Divider, Callout
- **Drag & Drop** — Reorder any block with intuitive drag handles (dnd-kit)
- **Undo / Redo** — Full history stack with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- **Auto-Persist** — All changes saved to `localStorage` automatically
- **Export / Import** — Export blocks as JSON or Markdown, import from JSON
- **Plug-and-Play Registry** — Add new block types with zero editor changes
- **Dark Theme** — Premium dark UI with accent colors, glassmorphism, and micro-animations
- **Keyboard-First** — Tab support in code blocks, Enter/Backspace in lists

##  Block Types

| Block | Description |
|-------|------------|
| **Text** | Rich paragraph block with auto-resizing textarea |
| **Heading** | H1–H3 with click-to-cycle level selector |
| **Image** | URL-based image with live preview and alt text |
| **Code** | Monospace editor with language selector, line numbers, and copy button |
| **Quote** | Styled blockquote with optional author attribution |
| **List** | Bullet or numbered list with dynamic item management |
| **Divider** | Visual separator with 4 styles (solid, dashed, dotted, gradient) |
| **Callout** | Alert box with 4 variants (info, warning, success, error) |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to start editing.

## 🏗️ Architecture

```
src/
├── components/
│   ├── blocks/
│   │   ├── registry.js        # Central block registry (plug-and-play)
│   │   ├── index.js           # Block type registrations
│   │   ├── TextBlock.jsx
│   │   ├── HeadingBlock.jsx
│   │   ├── ImageBlock.jsx
│   │   ├── CodeBlock.jsx
│   │   ├── QuoteBlock.jsx
│   │   ├── ListBlock.jsx
│   │   ├── DividerBlock.jsx
│   │   └── CalloutBlock.jsx
│   ├── BlockWrapper.jsx       # Chrome layer (drag, delete, duplicate)
│   ├── Editor.jsx             # Main editor surface with DnD context
│   ├── Toolbar.jsx            # Top bar (undo/redo/export/clear)
│   ├── AddBlockMenu.jsx       # Block type selector dropdown
│   └── ExportModal.jsx        # Export/Import modal
├── store/
│   └── useStore.js            # Zustand store (blocks + undo/redo history)
├── index.css                  # Design system + theme tokens
├── App.jsx
└── main.jsx
```

## 🔌 Adding Custom Blocks

BlockForge uses a **registry pattern** — adding a new block type requires zero changes to the editor:

1. Create your component in `src/components/blocks/MyBlock.jsx`
2. Register it in `src/components/blocks/index.js`:

```js
import MyBlock from './MyBlock';

registerBlock('myblock', {
  component: MyBlock,
  defaultData: { /* initial content */ },
  icon: 'Sparkles',    // Lucide icon name
  label: 'My Block',
});
```

3. Add the icon to the `ICON_MAP` in `AddBlockMenu.jsx`
4. Done — your block appears in the menu automatically.

## 🛠 Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool
- **Zustand** — Lightweight state management
- **dnd-kit** — Accessible drag-and-drop
- **Tailwind CSS 4** — Utility-first styling
- **Lucide React** — Beautiful icons
- **nanoid** — Compact unique IDs

## 📦 Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |



MIT
#
