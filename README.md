# 🧱 BlockForge

A modern, modular block-based document editor built with **React 19**, **Zustand**, and **dnd-kit**. Create structured, interactive documents by composing independent, reorderable blocks — from text and headings to code snippets, callouts, and document imports.

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎬 Product Demo

<!-- Animated GIF / Interactive Demo Placeholder -->
```
 ┌────────────────────────────────────────────────────────────────────────┐
 │  BlockForge Toolbar — [Saved] [Undo] [Redo] | [Export] [Import]        │
 ├────────────────────────────────────────────────────────────────────────┤
 │                                                                        │
 │  H1 Document Architecture Overview                                     │
 │                                                                        │
 │  Type text or press '/' to open inline block menu                      │
 │  ┌─────────────────────────────────────────┐                           │
 │  │ / Slash Commands                        │                           │
 │  │ --------------------------------------- │                           │
 │  │  Type     Paragraph text                │                           │
 │  │  Heading  H1-H3 title block             │                           │
 │  │  Code     Monospace editor with syntax  │                           │
 │  │  Callout  Alert message container       │                           │
 │  └─────────────────────────────────────────┘                           │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Project Motivation

Modern productivity applications like **Notion**, **Linear**, **Raycast**, and **Framer** have set a high benchmark for user experience through clean visual hierarchy, keyboard-first workflows, micro-interactions, and spatial document composition. 

**BlockForge** was engineered to bring that same level of craftsmanship to a lightweight, standalone web application. The core objective is **quality over quantity** — providing a fast, predictable block editor with zero unnecessary bloat, clean state management, and a plug-and-play architecture.

---

## ✨ Highlights & Features

- **⚡ Slash Command (`/`) Menu** — Type `/` anywhere inside a block to launch a floating, keyboard-navigable block selector palette (`ArrowUp`, `ArrowDown`, `Enter`, `ESC`).
- **8 Built-in Block Types** — Text, Heading (H1–H3), Image, Code, Quote, List, Divider, and Callout.
- **Drag & Drop Reordering** — Reorder any block with fluid drag elevation and accessible keyboard coordinates via `dnd-kit`.
- **Undo / Redo History Stack** — Capped history stack managed by Zustand, supporting `Ctrl+Z` and `Ctrl+Shift+Z` keyboard shortcuts.
- **Auto-Save Indicator** — Instant local storage persistence with visual status feedback.
- **Document Conversion & Import** — Upload `.txt` or `.docx` files to automatically parse and transform content into structured blocks.
- **Export Capabilities** — Export document state to clean JSON or formatted Markdown.
- **Plug-and-Play Block Registry** — Extensible block registry allowing developers to introduce new custom block types without editing core editor code.
- **Accessible & Responsive** — Strict `focus-visible` focus rings, high-contrast monochrome design system, and full ARIA semantics.

---

## 🧱 Block Types Overview

| Block | Icon | Description |
|-------|------|-------------|
| **Text** | `Type` | Paragraph block with auto-resizing textarea and inline `/` command support |
| **Heading** | `Heading1` | H1–H3 heading with click-to-cycle level selector |
| **Image** | `Image` | Image URL block with alt text and error fallback preview |
| **Code** | `Code2` | Monospace editor with language selection, line numbers, and copy button |
| **Quote** | `Quote` | Blockquote with optional author attribution |
| **List** | `List` | Bullet or numbered list with dynamic item management (`Enter`/`Backspace`) |
| **Divider** | `Minus` | Minimalist visual separator |
| **Callout** | `Info` | Container with 4 variants (Info, Warning, Success, Error) |

---

## 🏗️ Architecture & Dataflow

```
                    ┌─────────────────────────┐
                    │      React 19 App       │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
      ┌──────────────────┐               ┌──────────────────┐
      │   Top Toolbar    │               │  Editor Surface  │
      └────────┬─────────┘               └────────┬─────────┘
               │                                  │
               │   ┌──────────────────────────────┼──────────────────────────────┐
               │   │                              │                              │
               ▼   ▼                              ▼                              ▼
      ┌──────────────────┐               ┌──────────────────┐           ┌──────────────────┐
      │  Export Modal    │               │  Block Wrapper   │           │ Slash Cmd Menu   │
      └──────────────────┘               └────────┬─────────┘           └──────────────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │    Block Registry    │
                                       │ (TextBlock, H1, etc) │
                                       └──────────┬───────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │    Zustand Store     │
                                       │ (State + History)    │
                                       └──────────────────────┘
```

---

## 🛠️ Engineering Challenges & Trade-offs

### 1. Controlled State vs. History Stack Performance
* **Challenge:** Syncing controlled inputs with a central state store on every keystroke causes heavy re-renders and floods the undo/redo history stack.
* **Solution:** Block components maintain lightweight local state while emitting debounced updates (400ms) to the Zustand store for history snapshots. Controlled state is synchronized during render when external props change (e.g. on undo/redo actions), avoiding React `useEffect` cascading re-renders.

### 2. Extensible Block Registry Pattern
* **Challenge:** Traditional rich text editors tightly couple block rendering with core editor component logic, making third-party extensibility fragile.
* **Solution:** Implemented a decoupled registry (`src/components/blocks/registry.js`). New block types are registered with a single function call defining component, default schema, icon, and label. Both `Editor`, `AddBlockMenu`, and `SlashCommandMenu` read dynamically from the registry.

### 3. Smooth Drag Elevation & dnd-kit Integration
* **Challenge:** Providing visual drag elevation feedback without triggering layout shifts or breaking accessibility.
* **Solution:** Configured `PointerSensor` activation constraints (`distance: 5px`) and applied smooth scale transforms (`scale-[1.01]`), backdrop blur, and custom drag overlays (`.drag-overlay`).

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Cyberpunk738/Block-forge.git

# 2. Install dependencies
cd Block-forge
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production distribution bundle |
| `npm run preview` | Locally preview production build |
| `npm run lint` | Run ESLint checks |

---

## 🔮 Future Roadmap

- [ ] Multi-block selection & batch dragging
- [ ] Table / Grid block type registration
- [ ] Custom keybinding configuration modal
- [ ] Offline PWA support with IndexedDB sync

---

## 📄 License

MIT © BlockForge
