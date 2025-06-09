# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an Electron + TypeScript + React desktop application that loads and displays the Gemini AI web interface (https://gemini.google.com/app).

## Key Technologies
- **Electron**: Desktop application framework
- **TypeScript**: Primary language for type safety
- **React**: UI framework (minimal usage, mainly for fallback pages)
- **Vite**: Modern build tool for fast development and optimized production builds

## Architecture
- **Main Process** (`src/main/main.ts`): Electron main process that creates the browser window and loads the Gemini AI website
- **Renderer Process** (`src/renderer/`): Minimal React components for fallback UI
- **Build System**: Vite for renderer process, TypeScript compiler for main process

## Development Guidelines
- Use TypeScript for all new code
- Follow Electron security best practices
- Keep the main process focused on window management and native functionality
- The application primarily acts as a wrapper around the Gemini AI web interface
