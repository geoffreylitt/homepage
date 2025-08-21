# Astro Port Generator - Interactive

An interactive visualization tool for the Middleman to Astro port process. This application provides a side-by-side view of the original Middleman site and the generated Astro site, with step-by-step execution of the port stages.

## Features

- **Stage-by-stage visualization**: Execute each port stage and see real-time changes
- **Side-by-side preview**: Live dev servers for both Middleman and Astro sites
- **File tree explorer**: Browse and inspect files in both codebases
- **Code viewer**: View file contents with syntax highlighting
- **Link mode**: QA mode that maps corresponding files between sites
- **Dev server management**: Start/stop dev servers directly from the UI

## Getting Started

1. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

2. Start the development environment:
```bash
npm run dev
```

This will start:
- Express server on port 3001
- React client on port 3002
- Proxy API calls from client to server

## Architecture

- **Backend**: Express.js server providing APIs for file system operations, dev server management, and port stage execution
- **Frontend**: React application with Tailwind CSS, featuring a dark "airline cockpit" theme
- **File watching**: Simple polling mechanism for detecting changes
- **Dev servers**: Manages Middleman (port 3000) and Astro (port 4321) development servers

## UI Layout

```
┌─────────────────────────────────────┐
│         WIZARD (Stages 1-7)         │
├──────────────┬──────────────────────┤
│  MIDDLEMAN   │      ASTRO           │
│  ┌─────────┐ │  ┌─────────┐        │
│  │ iframe  │ │  │ iframe  │        │
│  │ :3000   │ │  │ :4321   │        │
│  └─────────┘ │  └─────────┘        │
│  [■ Stop]    │  [▶ Start]           │
│  ┌─────────┐ │  ┌─────────┐        │
│  │ File    │ │  │ File    │        │
│  │ Tree    │ │  │ Tree    │        │
│  └─────────┘ │  └─────────┘        │
└──────────────┴──────────────────────┘
```