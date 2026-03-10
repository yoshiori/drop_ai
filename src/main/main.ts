import { app, BrowserWindow, Menu, Tray, nativeImage, shell, globalShortcut, screen, session } from 'electron';
import { WindowManager } from './windowManager';
import { TrayManager } from './trayManager';
import { buildMenuTemplate, MENU_IDS } from './menuBuilder';
import { CLAUDE_URL } from './constants';
import { createWindowOpenHandler } from './windowOpenHandler';

let windowManager: WindowManager;
let trayManager: TrayManager;

function handleNewChat(): void {
  const win = windowManager.getWindow();
  if (win) {
    win.loadURL(CLAUDE_URL).catch((error) => {
      console.error('Failed to load URL for New Chat:', error);
    });
  }
}

function handleReload(): void {
  const win = windowManager.getWindow();
  if (win) win.reload();
}

function createMenu(): void {
  const template = buildMenuTemplate(process.platform, app.getName());

  // Attach click handlers using stable menu item IDs
  const fileMenu = template.find((item) => item.label === 'File');
  if (fileMenu && Array.isArray(fileMenu.submenu)) {
    for (const item of fileMenu.submenu) {
      switch (item.id) {
        case MENU_IDS.TOGGLE_WINDOW:
          item.click = () => windowManager.toggleWindow();
          break;
        case MENU_IDS.NEW_CHAT:
          item.click = () => handleNewChat();
          break;
        case MENU_IDS.RELOAD:
          item.click = () => handleReload();
          break;
        case MENU_IDS.HIDE_WINDOW:
          item.click = () => windowManager.hideWindow();
          break;
        case MENU_IDS.QUIT:
          item.click = () => app.quit();
          break;
      }
    }
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function initialize(): void {
  app.whenReady().then(() => {
    windowManager = new WindowManager({ BrowserWindow, screen, session });
    windowManager.createWindow({
      isDevelopment: process.env.NODE_ENV === 'development',
      useDevServer: !!process.env.VITE_DEV_SERVER,
    });

    createMenu();

    trayManager = new TrayManager({ Tray, Menu, nativeImage }, {
      onToggleWindow: () => windowManager.toggleWindow(),
      onNewChat: handleNewChat,
      onReload: handleReload,
      onQuit: () => app.quit(),
    });
    trayManager.createTray();

    const registered = globalShortcut.register('F12', () => {
      windowManager.toggleWindow();
    });

    if (!registered) {
      console.log('Failed to register global shortcut F12');
    }

    console.log('Global shortcut F12 registered:', globalShortcut.isRegistered('F12'));
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  // For top-down terminal style, don't quit when window is closed
  // The app should keep running in the background
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation with protocol validation
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(createWindowOpenHandler(shell));
});

if (process.env.NODE_ENV !== 'test') {
  initialize();
}
