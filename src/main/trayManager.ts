import type { Tray as TrayType, Menu as MenuType, nativeImage as nativeImageType } from 'electron';
import * as path from 'path';

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

export class TrayManager {
  private tray: TrayType | null = null;
  private deps: TrayManagerDeps;
  private callbacks: TrayManagerCallbacks;

  constructor(deps: TrayManagerDeps, callbacks: TrayManagerCallbacks) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  createTray(): void {
    const iconPath = path.join(__dirname, '../../assets/tray-icon-22.png');
    const icon = this.deps.nativeImage.createFromPath(iconPath);
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
