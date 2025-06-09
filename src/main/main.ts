import { app, BrowserWindow, Menu, shell, globalShortcut, Tray, screen } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow;
let isWindowVisible = false;
let tray: Tray | null = null;

function createWindow(): void {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window with top-down terminal style
  mainWindow = new BrowserWindow({
    height: Math.floor(screenHeight * 0.6), // 60% of screen height
    width: screenWidth, // Full screen width
    x: 0,
    y: -Math.floor(screenHeight * 0.6), // Start hidden above screen
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading external content
    },
    frame: false, // Frameless window
    alwaysOnTop: true, // Always on top
    skipTaskbar: true, // Don't show in taskbar
    resizable: false, // Disable resizing
    movable: false, // Disable moving
    title: 'Gemini AI Desktop',
    show: false, // Don't show until ready-to-show
    // transparent: true, // Make window transparent - disabled for compatibility
    backgroundColor: '#1a1a1a', // Dark background instead of transparent
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    // Window is ready but don't show it yet
    // It will be shown by the toggle function
  });

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    // Add a small delay to avoid hiding when clicking on menus
    setTimeout(() => {
      if (isWindowVisible && !mainWindow.isDestroyed() && !mainWindow.isFocused()) {
        hideWindow();
      }
    }, 100);
  });

  // Load the Gemini AI website with error handling
  const targetUrl = process.env.NODE_ENV === 'development' && process.env.VITE_DEV_SERVER
    ? 'http://localhost:3000'
    : 'https://gemini.google.com/app';

  mainWindow.loadURL(targetUrl).catch((error) => {
    console.error(`Failed to load ${targetUrl}:`, error);
    // Load fallback page if external site fails
    const fallbackPath = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(fallbackPath);
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation errors (e.g., network issues)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode !== -3) { // -3 is ABORTED, which is normal
      console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
      // Optionally load fallback page
      const fallbackPath = path.join(__dirname, '../renderer/index.html');
      mainWindow.loadFile(fallbackPath);
    }
  });

  // Create menu and tray
  createMenu();
  createTray();
}

// Function to show window with slide-down animation
function showWindow(): void {
  if (!mainWindow || isWindowVisible || mainWindow.isDestroyed()) return;

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const windowHeight = Math.floor(screenHeight * 0.6);

  isWindowVisible = true;

  try {
    mainWindow.setPosition(0, -windowHeight);
    mainWindow.show();

    // Animate sliding down
    const animationSteps = 20;
    const stepSize = windowHeight / animationSteps;
    let currentY = -windowHeight;

    const slideInterval = setInterval(() => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        clearInterval(slideInterval);
        return;
      }

      try {
        currentY += stepSize;
        if (currentY >= 0) {
          currentY = 0;
          clearInterval(slideInterval);
        }
        mainWindow.setPosition(0, Math.floor(currentY));
      } catch (error) {
        console.error('Error during slide animation:', error);
        clearInterval(slideInterval);
      }
    }, 10);

    mainWindow.focus();
  } catch (error) {
    console.error('Error showing window:', error);
    isWindowVisible = false;
  }
}

// Function to hide window with slide-up animation
function hideWindow(): void {
  if (!mainWindow || !isWindowVisible || mainWindow.isDestroyed()) return;

  const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const windowHeight = Math.floor(screenHeight * 0.6);

  isWindowVisible = false;

  try {
    // Animate sliding up
    const animationSteps = 20;
    const stepSize = windowHeight / animationSteps;
    let currentY = 0;

    const slideInterval = setInterval(() => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        clearInterval(slideInterval);
        return;
      }

      try {
        currentY -= stepSize;
        if (currentY <= -windowHeight) {
          currentY = -windowHeight;
          clearInterval(slideInterval);
          if (!mainWindow.isDestroyed()) {
            mainWindow.hide();
          }
        } else {
          mainWindow.setPosition(0, Math.floor(currentY));
        }
      } catch (error) {
        console.error('Error during hide animation:', error);
        clearInterval(slideInterval);
        if (!mainWindow.isDestroyed()) {
          mainWindow.hide();
        }
      }
    }, 10);
  } catch (error) {
    console.error('Error hiding window:', error);
    if (!mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  }
}

// Function to toggle window visibility
function toggleWindow(): void {
  if (isWindowVisible) {
    hideWindow();
  } else {
    showWindow();
  }
}

function createTray(): void {
  // Create system tray (optional - you can remove this if not needed)
  // Note: You'll need to add an icon file for this
  // tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  // tray.setToolTip('Gemini AI Desktop');
  // tray.on('click', toggleWindow);
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Toggle Window',
          accelerator: 'F12',
          click: () => {
            toggleWindow();
          },
        },
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.loadURL('https://gemini.google.com/app');
          },
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Hide Window',
          accelerator: 'Escape',
          click: () => {
            hideWindow();
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Register global shortcut for toggling window
  // Using F12 as it's more reliable across different systems
  const registered = globalShortcut.register('F12', () => {
    toggleWindow();
  });

  if (!registered) {
    console.log('Failed to register global shortcut F12');
  }

  // Check if shortcut is registered
  console.log('Global shortcut F12 registered:', globalShortcut.isRegistered('F12'));
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  // For top-down terminal style, don't quit when window is closed
  // The app should keep running in the background
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts when app is about to quit
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
