# Flow Builder — Visual Workflow Editor (React + TypeScript)

A frontend-only visual workflow builder (n8n-style) that lets you drag predefined nodes onto a canvas, connect them, and configure each via forms. Flows can be **exported/imported as JSON** and **auto-saved** to `localStorage`. Includes **Undo/Redo** and **Export as PNG**.

**Live Demo:** https://visual-workflow-app.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Manual Installation](#manual-installation)
- [Build & Preview](#build--preview)
- [Libraries Used & Why](#libraries-used--why)
- [Known Limitations](#known-limitations)
- [If I Had More Time](#if-i-had-more-time)

---

## Features

- **Drag & Drop Nodes** from a left palette: `webhook`, `code`, `http`, `smtp`
- **Canvas** with pan/zoom, move nodes, connect edges, delete
- **Right Sidebar** shows **read-only** properties for selected node
- **Double-click Modal** to configure node via **forms** (no direct JSON edits)
- **Export/Import JSON** (validated) + clear error messages
- **Auto-save** to `localStorage` and restore on reload
- **Undo/Redo** (buttons + keyboard shortcuts)
- **Export PNG** of the canvas (for quick sharing)
- Clean, accessible, minimal UI

---

## Project Structure

```
src/
├─ App.tsx
├─ FlowBuilder.tsx
├─ components/
│ ├─ Modal.tsx
│ ├─ Palette.tsx
│ ├─ PropertiesPanel.tsx
│ ├─ nodes/
│ │ ├─ GenericNode.tsx
│ │ └─ nodeTypes.tsx
│ └─ editors/
│ ├─ NodeEditor.tsx
│ ├─ WebhookEditor.tsx
│ ├─ CodeEditor.tsx
│ ├─ HttpEditor.tsx
│ └─ SmtpEditor.tsx
├─ hooks/
│ └─ useHistory.ts
├─ utils/
│ ├─ defaults.ts
│ ├─ storage.ts
│ └─ validate.ts
└─ types/
└─ flow.ts
```

## Manual Installation

If you want installation manually, follow these steps:

Clone the repo:

```bash
git clone https://github.com/razumolla/visual-workflow.git
cd visual-workflow
```

Install the dependencies:

```bash
npm install
```

Running locally:

```bash
npm run dev
```

### Build & Preview

production build:

```bash
npm run build
```

local preview of the build

```bash

npm run preview
```

## Libraries Used & Why

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [ReactFlow](https://reactflow.dev/) - Canvas library :battle-tested graph editor primitives (pan/zoom, nodes, edges, minimap, controls).
- [html-to-image](https://github.com/bubkoo/html-to-image) — PNG export for the canvas snapshot.

## Known Limitations

- No backend: frontend-only; flows are not persisted server-side.
- Minimal field validation (type checks; no deep schema).
- Simple layout : no auto-layout or advanced snapping

## If I Had More Time

- Schema-driven forms (Zod Schema) with richer validation.
- Edge rules & execution simulation.
- Multi-select & marquee selection; copy/paste nodes.
- Theming and dark mode.
