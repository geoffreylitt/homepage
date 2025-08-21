# Astro Port Generator - Interactive

## Overview
This is an interactive Bloomberg terminal-style interface for migrating a Middleman static site to Astro. The app provides real-time visualization of the migration process with live file trees, command execution, and preview panes.

## Architecture

### Frontend (React + Vite)
- **Location**: `client/` directory
- **Port**: http://localhost:3002 (development)
- **Styling**: Bloomberg terminal aesthetic with orange (#ff6900) accents, monospace fonts, and strict grid layout

### Backend (Node.js + Express)
- **Location**: `server/` directory  
- **Port**: http://localhost:3001
- **Purpose**: API server for file operations, stage execution, and dev server management

## Key Components

### Layout
- **3-column layout**: Step Executor | Middleman Source | Astro Generated
- **Draggable boundaries** using Allotment library
- **Bloomberg terminal styling** with orange borders and dense information display

### Core Features

#### 1. Stage Execution System
- **8 migration stages** defined in `server/api/generator.ts`
- **External generator**: Loads from `../astro-port-generator/generate-transparent.js`
- **Command transparency**: All commands logged via `CommandExecutor` utility
- **Status tracking**: pending → running → completed/error

#### 2. File Tree Visualization
- **Real-time file trees** for both Middleman source and Astro generated
- **New file highlighting**: Files created during stages appear in green
- **Link mode**: Shows corresponding files between source and target

#### 3. Live Previews
- **Dev server controls** for starting/stopping Middleman and Astro servers
- **Iframe previews** with automatic port detection
- **Code viewer** with syntax highlighting

## Recent Enhancements

### Bloomberg Terminal UI (Aug 2024)
- Migrated from "cockpit" theme to Bloomberg terminal aesthetic
- Font size: 13px Monaco/Menlo for dense information display
- Color scheme: Black background, white text, orange (#ff6900) accents
- No rounded corners, strict rectangular grid system

### New File Highlighting System
- **Hook**: `useStageFiles` tracks file snapshots before/after stage execution
- **Visual feedback**: Green highlighting for new files and containing directories
- **Ephemeral tracking**: Highlighting resets when navigating between stages

### Recent Fixes
- **Iframe flickering**: Fixed unnecessary remounting on server status polls
- **Port tracking**: Improved detection of actual server ports vs configured ports

## Development

### Running the App
```bash
npm run dev  # Starts both client (3002) and server (3001)
```

### Key Directories
- `client/src/components/`: React components
- `client/src/hooks/`: Custom React hooks
- `server/api/`: Express API routes
- `server/utils/`: Backend utilities (CommandExecutor, etc.)

### Important Files
- `App.tsx`: Main application layout and state management
- `FileTree.tsx`: File tree visualization with highlighting
- `useStageFiles.js`: New file tracking hook
- `CommandExecutor.ts`: Terminal command logging and execution

## Troubleshooting

### Debug Mode
The app includes extensive console logging for debugging:
- `🔍 [useStageFiles]`: File tracking operations
- `🌳 [FileTree]`: File tree rendering and highlighting
- `🧙 [Wizard]`: Stage execution flow
- `🏠 [App]`: Top-level state changes

### Common Issues
- **File highlighting not working**: Check browser console for useStageFiles logs
- **Iframe flickering**: Verify port detection logic in IframePreview.tsx
- **Server connection**: Ensure both client (3002) and server (3001) are running
- **Generator changes not taking effect**: The external generator module (`../astro-port-generator/generate-transparent.js`) is not watched by nodemon. After editing generator functions, you must manually restart the dev server with `npm run dev`

## External Dependencies
- **Generator**: `../astro-port-generator/generate-transparent.js`
- **Source site**: `../../source` (Middleman)
- **Target site**: `./astro-port-generated` (created by generator)