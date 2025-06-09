# Gemini AI Desktop App

A modern desktop application built with Electron, TypeScript, React, and Vite that provides native app experience for Gemini AI (https://gemini.google.com/app).

## Features

- Run Gemini AI web interface as a desktop application
- Native menu bar integration
- Keyboard shortcuts support
- Proper external link handling
- **Vite** for fast builds and HMR (Hot Module Replacement)

## Requirements

- Node.js 16 or higher
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

## Development

```bash
# Development mode (application only)
npm run dev

# Development mode (Vite server + Electron concurrent)
npm run dev:concurrent

# Start Vite dev server only
npm run dev:renderer

# Build
npm run build

# Start application
npm start

# Clean build files
npm run clean
```

### VS Code Tasks

Use the Command Palette (`Ctrl+Shift+P`) and select `Tasks: Run Task` to execute:

- `Build and Run Electron App`: Build and start the application
- `Start Vite Dev Server`: Start Vite development server
- `Development Mode (Concurrent)`: Development mode (Vite + Electron concurrent)
- `Build with Vite`: Build the project
- `Clean Build`: Clean build files

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New chat
- `Ctrl/Cmd + R`: Reload
- `Ctrl/Cmd + Q`: Quit application

## Project Structure

```
src/
├── main/           # Electron main process
│   └── main.ts     # Main process entry point
└── renderer/       # Renderer process (fallback UI)
    ├── index.html  # HTML template
    └── index.tsx   # React components
```

## Build Configuration

- `vite.config.ts`: Vite configuration (for renderer process)
- `tsconfig.json`: TypeScript configuration for renderer process
- `tsconfig.main.json`: TypeScript configuration for main process

## Vite Benefits

- ⚡ **Fast builds**: ~10x faster than Webpack
- 🔥 **HMR**: Hot module replacement for comfortable development experience
- 📦 **Modern setup**: Native support for ES modules and TypeScript
- 🎯 **Optimization**: Automatic optimization for production builds
