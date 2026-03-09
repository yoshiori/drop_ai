import type { Tray as TrayType, Menu as MenuType, nativeImage as nativeImageType } from 'electron';

export interface TrayManagerDeps {
  Tray: typeof TrayType;
  Menu: typeof MenuType;
  nativeImage: typeof nativeImageType;
}

export interface TrayManagerCallbacks {
  onToggleWindow: () => void;
  onNewChat: () => void;
  onQuit: () => void;
}

// 16x16 simple "D" icon as a data URL (white on transparent)
const TRAY_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
  'QklEQVQ4y2P4z8BQz0BAwMDAwMDEQCJgGDUAAYi1GBj+MzD8Z2D4D8T/Gf4zMPwH0v8Z' +
  'GP4z/GdgYBg1AAEADO4HERAiKaAAAAAASUVORK5CYII=';

export class TrayManager {
  private tray: TrayType | null = null;
  private deps: TrayManagerDeps;
  private callbacks: TrayManagerCallbacks;

  constructor(deps: TrayManagerDeps, callbacks: TrayManagerCallbacks) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  createTray(): void {
    const icon = this.deps.nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
    this.tray = new this.deps.Tray(icon);
    this.tray.setToolTip('DropAI');

    const contextMenu = this.deps.Menu.buildFromTemplate([
      {
        label: 'Toggle Window',
        click: () => this.callbacks.onToggleWindow(),
      },
      {
        label: 'New Chat',
        click: () => this.callbacks.onNewChat(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.callbacks.onQuit(),
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy(): void {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy();
    }
    this.tray = null;
  }
}
