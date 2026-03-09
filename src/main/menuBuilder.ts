export const MENU_IDS = {
  TOGGLE_WINDOW: 'toggle-window',
  NEW_CHAT: 'new-chat',
  RELOAD: 'reload',
  HIDE_WINDOW: 'hide-window',
  QUIT: 'quit',
} as const;

/**
 * Build the application menu template as a pure function.
 * Separates menu structure from Electron Menu API for testability.
 */
export function buildMenuTemplate(
  platform: string,
  appName: string = 'DropAI',
): Electron.MenuItemConstructorOptions[] {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          id: MENU_IDS.TOGGLE_WINDOW,
          label: 'Toggle Window',
          accelerator: 'F12',
        },
        {
          id: MENU_IDS.NEW_CHAT,
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
        },
        {
          id: MENU_IDS.RELOAD,
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
        },
        { type: 'separator' },
        {
          id: MENU_IDS.HIDE_WINDOW,
          label: 'Hide Window',
          accelerator: 'Escape',
        },
        { type: 'separator' },
        {
          id: MENU_IDS.QUIT,
          label: 'Quit',
          accelerator: platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
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

  if (platform === 'darwin') {
    template.unshift({
      label: appName,
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

  return template;
}
