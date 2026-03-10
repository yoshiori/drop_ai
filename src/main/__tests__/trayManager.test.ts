import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrayManager } from '../trayManager';

function createMockTray() {
  return {
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn().mockReturnValue(false),
  };
}

function createMockDeps(overrides: Record<string, unknown> = {}) {
  const mockTray = createMockTray();
  const MockTray = vi.fn().mockReturnValue(mockTray);
  const mockMenu = { buildFromTemplate: vi.fn().mockReturnValue({}) };
  const mockNativeImage = {
    createFromPath: vi.fn().mockReturnValue('mock-icon'),
  };

  return {
    Tray: MockTray as unknown as typeof Electron.Tray,
    Menu: mockMenu as unknown as typeof Electron.Menu,
    nativeImage: mockNativeImage as unknown as typeof Electron.nativeImage,
    mockTray,
    ...overrides,
  };
}

describe('TrayManager', () => {
  let callbacks: Record<string, () => void>;

  beforeEach(() => {
    callbacks = {};
  });

  function createTrayManager(deps = createMockDeps()) {
    const tm = new TrayManager(deps, {
      onToggleWindow: callbacks.toggleWindow || vi.fn(),
      onNewChat: callbacks.newChat || vi.fn(),
      onReload: callbacks.reload || vi.fn(),
      onQuit: callbacks.quit || vi.fn(),
    });
    return { tm, deps };
  }

  describe('createTray', () => {
    let tm: ReturnType<typeof createTrayManager>['tm'];
    let deps: ReturnType<typeof createTrayManager>['deps'];

    beforeEach(() => {
      ({ tm, deps } = createTrayManager());
      tm.createTray();
    });

    it('should create a Tray with an icon', () => {
      expect(deps.nativeImage.createFromPath).toHaveBeenCalled();
      expect(deps.Tray).toHaveBeenCalledWith('mock-icon');
    });

    it('should set tooltip to DropAI', () => {
      expect(deps.mockTray.setToolTip).toHaveBeenCalledWith('DropAI');
    });

    it('should set a context menu', () => {
      expect(deps.Menu.buildFromTemplate).toHaveBeenCalled();
      expect(deps.mockTray.setContextMenu).toHaveBeenCalled();
    });

    it('should build context menu with correct items', () => {
      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const labels = template.map((item: { label?: string; type?: string }) => item.label || item.type);
      expect(labels).toEqual(['Toggle Window', 'New Chat', 'Reload', 'separator', 'Quit']);
    });
  });

  describe('context menu actions', () => {
    it.each([
      { label: 'Toggle Window', callbackName: 'toggleWindow' },
      { label: 'New Chat', callbackName: 'newChat' },
      { label: 'Reload', callbackName: 'reload' },
      { label: 'Quit', callbackName: 'quit' },
    ])('should call callback for "$label"', ({ label, callbackName }) => {
      const callbackFn = vi.fn();
      callbacks[callbackName] = callbackFn;

      const { tm, deps } = createTrayManager();
      tm.createTray();

      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const menuItem = template.find((item: { label?: string }) => item.label === label);
      menuItem.click();

      expect(callbackFn).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should destroy the tray', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();
      tm.destroy();

      expect(deps.mockTray.destroy).toHaveBeenCalled();
    });

    it('should not throw when tray is not created', () => {
      const { tm } = createTrayManager();
      expect(() => tm.destroy()).not.toThrow();
    });

    it('should not throw when tray is already destroyed', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();
      deps.mockTray.isDestroyed.mockReturnValue(true);
      expect(() => tm.destroy()).not.toThrow();
      expect(deps.mockTray.destroy).not.toHaveBeenCalled();
    });
  });
});
