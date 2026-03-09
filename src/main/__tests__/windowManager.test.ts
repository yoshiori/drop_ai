import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WindowManager } from '../windowManager';
import { WINDOW_HEIGHT_RATIO, GEMINI_URL, DEV_SERVER_URL } from '../constants';

function createMockBrowserWindow() {
  const listeners: Record<string, Function[]> = {};
  return {
    show: vi.fn(),
    hide: vi.fn(),
    focus: vi.fn(),
    reload: vi.fn(),
    setPosition: vi.fn(),
    isDestroyed: vi.fn().mockReturnValue(false),
    isFocused: vi.fn().mockReturnValue(true),
    loadURL: vi.fn().mockResolvedValue(undefined),
    loadFile: vi.fn().mockResolvedValue(undefined),
    on: vi.fn((event: string, cb: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }),
    once: vi.fn(),
    webContents: {
      openDevTools: vi.fn(),
      setWindowOpenHandler: vi.fn(),
      on: vi.fn(),
    },
    _listeners: listeners,
    _emit(event: string) {
      (listeners[event] || []).forEach((cb) => cb());
    },
  };
}

function createMockDeps(overrides: Record<string, unknown> = {}) {
  const mockWindow = createMockBrowserWindow();
  const MockBrowserWindow = vi.fn().mockReturnValue(mockWindow);

  return {
    BrowserWindow: MockBrowserWindow as unknown as typeof Electron.BrowserWindow,
    screen: {
      getPrimaryDisplay: vi.fn().mockReturnValue({
        workAreaSize: { width: 1920, height: 1080 },
      }),
    } as unknown as Electron.Screen,
    session: {
      fromPartition: vi.fn().mockReturnValue({}),
    } as unknown as typeof Electron.session,
    shell: {
      openExternal: vi.fn(),
    } as unknown as typeof Electron.shell,
    mockWindow,
    ...overrides,
  };
}

describe('WindowManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createWindow', () => {
    it('should create a BrowserWindow with correct dimensions', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      const expectedHeight = Math.floor(1080 * WINDOW_HEIGHT_RATIO);
      expect(deps.BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          height: expectedHeight,
          width: 1920,
          x: 0,
          y: -expectedHeight,
        }),
      );
    });

    it('should load target URL in production', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      expect(deps.mockWindow.loadURL).toHaveBeenCalledWith(GEMINI_URL);
    });

    it('should load dev server URL in development', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow({ isDevelopment: true, useDevServer: true });

      expect(deps.mockWindow.loadURL).toHaveBeenCalledWith(DEV_SERVER_URL);
    });

    it('should load fallback HTML when loadURL fails', async () => {
      const deps = createMockDeps();
      deps.mockWindow.loadURL.mockRejectedValue(new Error('Network error'));
      const wm = new WindowManager(deps);
      wm.createWindow();

      await vi.waitFor(() => {
        expect(deps.mockWindow.loadFile).toHaveBeenCalled();
      });
    });

    it('should set frameless and alwaysOnTop options', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      expect(deps.BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          frame: false,
          alwaysOnTop: true,
          skipTaskbar: true,
          resizable: false,
          movable: false,
        }),
      );
    });

    it('should set webSecurity to true', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      expect(deps.BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          webPreferences: expect.objectContaining({
            webSecurity: true,
          }),
        }),
      );
    });

    it('should register closed event listener to clean up state', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      expect(deps.mockWindow.on).toHaveBeenCalledWith('closed', expect.any(Function));
    });

    it('should clean up state when window is closed', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();
      expect(wm.isVisible()).toBe(true);

      deps.mockWindow._emit('closed');

      expect(wm.getWindow()).toBeNull();
      expect(wm.isVisible()).toBe(false);
    });

    it('should validate URL protocol in setWindowOpenHandler', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      const handler = deps.mockWindow.webContents.setWindowOpenHandler.mock.calls[0][0];

      handler({ url: 'https://example.com' });
      expect(deps.shell.openExternal).toHaveBeenCalledWith('https://example.com');

      (deps.shell.openExternal as ReturnType<typeof vi.fn>).mockClear();
      handler({ url: 'file:///etc/passwd' });
      expect(deps.shell.openExternal).not.toHaveBeenCalled();
    });
  });

  describe('toggleWindow', () => {
    it('should show window when currently hidden', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      expect(wm.isVisible()).toBe(false);
      wm.toggleWindow();
      expect(wm.isVisible()).toBe(true);
    });

    it('should hide window when currently visible', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();

      wm.showWindow();
      expect(wm.isVisible()).toBe(true);
      wm.hideWindow();
      expect(wm.isVisible()).toBe(false);
    });
  });

  describe('showWindow', () => {
    it('should do nothing when window is not created', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.showWindow();
      expect(wm.isVisible()).toBe(false);
    });

    it('should do nothing when already visible', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();

      deps.mockWindow.show.mockClear();
      wm.showWindow();
      expect(deps.mockWindow.show).not.toHaveBeenCalled();
    });

    it('should do nothing when window is destroyed', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      deps.mockWindow.isDestroyed.mockReturnValue(true);

      wm.showWindow();
      expect(wm.isVisible()).toBe(false);
    });

    it('should call show and focus on the window', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();

      expect(deps.mockWindow.show).toHaveBeenCalled();
      expect(deps.mockWindow.focus).toHaveBeenCalled();
    });

    it('should animate with setPosition calls', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();

      vi.runAllTimers();

      expect(deps.mockWindow.setPosition).toHaveBeenCalled();
      const calls = deps.mockWindow.setPosition.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toEqual([0, 0]);
    });
  });

  describe('hideWindow', () => {
    it('should do nothing when window is not visible', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.hideWindow();
      expect(deps.mockWindow.hide).not.toHaveBeenCalled();
    });

    it('should do nothing when window is not created', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.hideWindow();
      expect(wm.isVisible()).toBe(false);
    });

    it('should do nothing when window is destroyed', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();
      deps.mockWindow.isDestroyed.mockReturnValue(true);

      wm.hideWindow();
      expect(wm.isVisible()).toBe(true);
    });

    it('should call hide after animation completes', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();
      vi.runAllTimers();

      wm.hideWindow();
      vi.runAllTimers();

      expect(deps.mockWindow.hide).toHaveBeenCalled();
      expect(wm.isVisible()).toBe(false);
    });
  });

  describe('animation conflict prevention', () => {
    it('should cancel ongoing show animation when hide is called', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      wm.showWindow();

      // Don't complete animation, immediately hide
      wm.hideWindow();
      vi.runAllTimers();

      expect(deps.mockWindow.hide).toHaveBeenCalled();
      expect(wm.isVisible()).toBe(false);
    });
  });

  describe('getWindow', () => {
    it('should return null before createWindow', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      expect(wm.getWindow()).toBeNull();
    });

    it('should return the window after createWindow', () => {
      const deps = createMockDeps();
      const wm = new WindowManager(deps);
      wm.createWindow();
      expect(wm.getWindow()).toBe(deps.mockWindow);
    });
  });
});
