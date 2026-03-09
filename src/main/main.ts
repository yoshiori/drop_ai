import { app, BrowserWindow, Menu, shell, globalShortcut, screen, session } from 'electron';
import { WindowManager } from './windowManager';
import { buildMenuTemplate, MENU_IDS } from './menuBuilder';
import { CLAUDE_URL, AUTH_DOMAINS } from './constants';

let windowManager: WindowManager;

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
          item.click = () => {
            const win = windowManager.getWindow();
            if (win) {
              win.loadURL(CLAUDE_URL).catch((error) => {
                console.error('Failed to load URL from New Chat menu item:', error);
              });
            }
          };
          break;
        case MENU_IDS.RELOAD:
          item.click = () => {
            const win = windowManager.getWindow();
            if (win) win.reload();
          };
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
    windowManager = new WindowManager({ BrowserWindow, screen, session, shell });
    windowManager.createWindow({
      isDevelopment: process.env.NODE_ENV === 'development',
      useDevServer: !!process.env.VITE_DEV_SERVER,
    });

    createMenu();

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
  contents.setWindowOpenHandler(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      const allowedProtocols = new Set(['https:', 'http:']);

      if (AUTH_DOMAINS.has(parsedUrl.hostname)) {
        return { action: 'allow' };
      }

      if (allowedProtocols.has(parsedUrl.protocol)) {
        void shell.openExternal(url);
      } else {
        console.warn(`[security] Blocked attempt to open external URL with disallowed protocol: ${url}`);
      }
    } catch (error) {
      console.warn(`[security] Failed to parse URL for external open: ${url}`, error);
    }
    return { action: 'deny' };
  });
});

if (process.env.NODE_ENV !== 'test') {
  initialize();
}
