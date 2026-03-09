import type { BrowserWindow as BrowserWindowType, Screen, Shell } from 'electron';
import * as path from 'path';
import { WINDOW_HEIGHT_RATIO, ANIMATION_STEPS, ANIMATION_INTERVAL_MS, GEMINI_URL, DEV_SERVER_URL } from './constants';
import { calculateSlideDownPositions, calculateSlideUpPositions } from './animation';

export interface WindowManagerDeps {
  BrowserWindow: typeof BrowserWindowType;
  screen: Screen;
  session: typeof Electron.session;
  shell: Shell;
}

export interface CreateWindowOptions {
  isDevelopment?: boolean;
  useDevServer?: boolean;
}

export class WindowManager {
  private mainWindow: BrowserWindowType | null = null;
  private _isVisible = false;
  private deps: WindowManagerDeps;

  constructor(deps: WindowManagerDeps) {
    this.deps = deps;
  }

  createWindow(options: CreateWindowOptions = {}): void {
    const { width: screenWidth, height: screenHeight } = this.deps.screen.getPrimaryDisplay().workAreaSize;
    const windowHeight = Math.floor(screenHeight * WINDOW_HEIGHT_RATIO);

    const persistentSession = this.deps.session.fromPartition('persist:gemini-session');

    this.mainWindow = new this.deps.BrowserWindow({
      height: windowHeight,
      width: screenWidth,
      x: 0,
      y: -windowHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        session: persistentSession,
      },
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      title: 'DropAI - AI Desktop Assistant',
      show: false,
      backgroundColor: '#1a1a1a',
    });

    this.mainWindow.once('ready-to-show', () => {
      // Window is ready but don't show it yet
    });

    this.mainWindow.on('blur', () => {
      setTimeout(() => {
        if (this._isVisible && this.mainWindow && !this.mainWindow.isDestroyed() && !this.mainWindow.isFocused()) {
          this.hideWindow();
        }
      }, 100);
    });

    const targetUrl = options.isDevelopment && options.useDevServer ? DEV_SERVER_URL : GEMINI_URL;

    this.mainWindow.loadURL(targetUrl).catch((error) => {
      console.error(`Failed to load ${targetUrl}:`, error);
      if (this.mainWindow) {
        const fallbackPath = path.join(__dirname, '../renderer/index.html');
        this.mainWindow.loadFile(fallbackPath);
      }
    });

    if (options.isDevelopment) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      this.deps.shell.openExternal(url);
      return { action: 'deny' };
    });

    this.mainWindow.webContents.on('did-fail-load', (_event: unknown, errorCode: number, errorDescription: string, validatedURL: string) => {
      if (errorCode !== -3) {
        console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
        if (this.mainWindow) {
          const fallbackPath = path.join(__dirname, '../renderer/index.html');
          this.mainWindow.loadFile(fallbackPath);
        }
      }
    });
  }

  showWindow(): void {
    if (!this.mainWindow || this._isVisible || this.mainWindow.isDestroyed()) return;

    const { height: screenHeight } = this.deps.screen.getPrimaryDisplay().workAreaSize;
    const windowHeight = Math.floor(screenHeight * WINDOW_HEIGHT_RATIO);

    this._isVisible = true;

    try {
      this.mainWindow.setPosition(0, -windowHeight);
      this.mainWindow.show();

      const positions = calculateSlideDownPositions(windowHeight, ANIMATION_STEPS);
      let step = 0;

      const slideInterval = setInterval(() => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
          clearInterval(slideInterval);
          return;
        }

        try {
          this.mainWindow.setPosition(0, positions[step]);
          step++;
          if (step >= positions.length) {
            clearInterval(slideInterval);
          }
        } catch (error) {
          console.error('Error during slide animation:', error);
          clearInterval(slideInterval);
        }
      }, ANIMATION_INTERVAL_MS);

      this.mainWindow.focus();
    } catch (error) {
      console.error('Error showing window:', error);
      this._isVisible = false;
    }
  }

  hideWindow(): void {
    if (!this.mainWindow || !this._isVisible || this.mainWindow.isDestroyed()) return;

    const { height: screenHeight } = this.deps.screen.getPrimaryDisplay().workAreaSize;
    const windowHeight = Math.floor(screenHeight * WINDOW_HEIGHT_RATIO);

    this._isVisible = false;

    try {
      const positions = calculateSlideUpPositions(windowHeight, ANIMATION_STEPS);
      let step = 0;

      const slideInterval = setInterval(() => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
          clearInterval(slideInterval);
          return;
        }

        try {
          this.mainWindow.setPosition(0, positions[step]);
          step++;
          if (step >= positions.length) {
            clearInterval(slideInterval);
            if (!this.mainWindow.isDestroyed()) {
              this.mainWindow.hide();
            }
          }
        } catch (error) {
          console.error('Error during hide animation:', error);
          clearInterval(slideInterval);
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.hide();
          }
        }
      }, ANIMATION_INTERVAL_MS);
    } catch (error) {
      console.error('Error hiding window:', error);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.hide();
      }
    }
  }

  toggleWindow(): void {
    if (this._isVisible) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }

  isVisible(): boolean {
    return this._isVisible;
  }

  getWindow(): BrowserWindowType | null {
    return this.mainWindow;
  }
}
