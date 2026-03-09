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
  private _isAnimating = false;
  private currentAnimationInterval: ReturnType<typeof setInterval> | null = null;
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
        webSecurity: true,
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

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this._isVisible = false;
      this.cancelAnimation();
    });

    const targetUrl = options.isDevelopment && options.useDevServer ? DEV_SERVER_URL : GEMINI_URL;

    this.mainWindow.loadURL(targetUrl).catch((error) => {
      console.error(`Failed to load ${targetUrl}:`, error);
      if (this.mainWindow) {
        const fallbackPath = path.join(__dirname, '../renderer/index.html');
        this.mainWindow.loadFile(fallbackPath).catch((fallbackError) => {
          console.error(`Failed to load fallback page:`, fallbackError);
        });
      }
    });

    if (options.isDevelopment) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      try {
        const parsedUrl = new URL(url);
        const allowedProtocols = new Set(['https:', 'http:']);

        if (allowedProtocols.has(parsedUrl.protocol)) {
          void this.deps.shell.openExternal(url);
        } else {
          console.warn(`[security] Blocked attempt to open external URL with disallowed protocol: ${url}`);
        }
      } catch (error) {
        console.warn(`[security] Failed to parse URL for external open: ${url}`, error);
      }
      return { action: 'deny' };
    });

    this.mainWindow.webContents.on('did-fail-load', (_event: unknown, errorCode: number, errorDescription: string, validatedURL: string) => {
      if (errorCode !== -3) {
        console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
        if (this.mainWindow) {
          const fallbackPath = path.join(__dirname, '../renderer/index.html');
          this.mainWindow.loadFile(fallbackPath).catch((fallbackError) => {
            console.error(`Failed to load fallback page:`, fallbackError);
          });
        }
      }
    });
  }

  showWindow(): void {
    if (!this.mainWindow || this._isVisible || this.mainWindow.isDestroyed()) return;

    this.cancelAnimation();

    const { height: screenHeight } = this.deps.screen.getPrimaryDisplay().workAreaSize;
    const windowHeight = Math.floor(screenHeight * WINDOW_HEIGHT_RATIO);

    this._isVisible = true;
    this._isAnimating = true;

    try {
      this.mainWindow.setPosition(0, -windowHeight);
      this.mainWindow.show();

      const positions = calculateSlideDownPositions(windowHeight, ANIMATION_STEPS);
      let step = 0;

      this.currentAnimationInterval = setInterval(() => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
          this.cancelAnimation();
          return;
        }

        try {
          this.mainWindow.setPosition(0, positions[step]);
          step++;
          if (step >= positions.length) {
            this.cancelAnimation();
          }
        } catch (error) {
          console.error('Error during slide animation:', error);
          this.cancelAnimation();
        }
      }, ANIMATION_INTERVAL_MS);

      this.mainWindow.focus();
    } catch (error) {
      console.error('Error showing window:', error);
      this._isVisible = false;
      this._isAnimating = false;
    }
  }

  hideWindow(): void {
    if (!this.mainWindow || !this._isVisible || this.mainWindow.isDestroyed()) return;

    this.cancelAnimation();

    const { height: screenHeight } = this.deps.screen.getPrimaryDisplay().workAreaSize;
    const windowHeight = Math.floor(screenHeight * WINDOW_HEIGHT_RATIO);

    this._isVisible = false;
    this._isAnimating = true;

    try {
      const positions = calculateSlideUpPositions(windowHeight, ANIMATION_STEPS);
      let step = 0;

      this.currentAnimationInterval = setInterval(() => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
          this.cancelAnimation();
          return;
        }

        try {
          this.mainWindow.setPosition(0, positions[step]);
          step++;
          if (step >= positions.length) {
            this.cancelAnimation();
            if (!this.mainWindow.isDestroyed()) {
              this.mainWindow.hide();
            }
          }
        } catch (error) {
          console.error('Error during hide animation:', error);
          this.cancelAnimation();
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.hide();
          }
        }
      }, ANIMATION_INTERVAL_MS);
    } catch (error) {
      console.error('Error hiding window:', error);
      this._isAnimating = false;
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

  private cancelAnimation(): void {
    if (this.currentAnimationInterval !== null) {
      clearInterval(this.currentAnimationInterval);
      this.currentAnimationInterval = null;
    }
    this._isAnimating = false;
  }
}
