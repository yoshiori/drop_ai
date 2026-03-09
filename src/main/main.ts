import { app, BrowserWindow, Menu, shell, globalShortcut, screen, session } from 'electron';
import { WindowManager } from './windowManager';
import { buildMenuTemplate } from './menuBuilder';
import { GEMINI_URL } from './constants';

let windowManager: WindowManager;

function createMenu(): void {
  const template = buildMenuTemplate(process.platform, app.getName());

  // Attach click handlers that reference the window manager
  const fileMenu = template.find((item) => item.label === 'File');
  if (fileMenu && Array.isArray(fileMenu.submenu)) {
    for (const item of fileMenu.submenu) {
      switch (item.label) {
        case 'Toggle Window':
          item.click = () => windowManager.toggleWindow();
          break;
        case 'New Chat':
          item.click = () => {
            const win = windowManager.getWindow();
            if (win) win.loadURL(GEMINI_URL);
          };
          break;
        case 'Reload':
          item.click = () => {
            const win = windowManager.getWindow();
            if (win) win.reload();
          };
          break;
        case 'Hide Window':
          item.click = () => windowManager.hideWindow();
          break;
        case 'Quit':
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

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

if (process.env.NODE_ENV !== 'test') {
  initialize();
}
