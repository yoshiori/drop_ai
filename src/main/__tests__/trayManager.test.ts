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
  let callbacks: Record<string, Function>;

  beforeEach(() => {
    callbacks = {};
  });

  function createTrayManager(deps = createMockDeps()) {
    const tm = new TrayManager(deps, {
      onToggleWindow: callbacks.toggleWindow || vi.fn(),
      onNewChat: callbacks.newChat || vi.fn(),
      onQuit: callbacks.quit || vi.fn(),
    });
    return { tm, deps };
  }

  describe('createTray', () => {
    it('should create a Tray with an icon', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();

      expect(deps.nativeImage.createFromPath).toHaveBeenCalled();
      expect(deps.Tray).toHaveBeenCalledWith('mock-icon');
    });

    it('should set tooltip to DropAI', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();

      expect(deps.mockTray.setToolTip).toHaveBeenCalledWith('DropAI');
    });

    it('should set a context menu', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();

      expect(deps.Menu.buildFromTemplate).toHaveBeenCalled();
      expect(deps.mockTray.setContextMenu).toHaveBeenCalled();
    });

    it('should build context menu with correct items', () => {
      const { tm, deps } = createTrayManager();
      tm.createTray();

      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const labels = template.map((item: { label?: string; type?: string }) => item.label || item.type);
      expect(labels).toEqual(['Toggle Window', 'New Chat', 'separator', 'Quit']);
    });
  });

  describe('context menu actions', () => {
    it('should call onToggleWindow when Toggle Window is clicked', () => {
      const toggleFn = vi.fn();
      callbacks.toggleWindow = toggleFn;
      const { tm, deps } = createTrayManager();
      tm.createTray();

      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const toggleItem = template.find((item: { label?: string }) => item.label === 'Toggle Window');
      toggleItem.click();

      expect(toggleFn).toHaveBeenCalled();
    });

    it('should call onNewChat when New Chat is clicked', () => {
      const newChatFn = vi.fn();
      callbacks.newChat = newChatFn;
      const { tm, deps } = createTrayManager();
      tm.createTray();

      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const newChatItem = template.find((item: { label?: string }) => item.label === 'New Chat');
      newChatItem.click();

      expect(newChatFn).toHaveBeenCalled();
    });

    it('should call onQuit when Quit is clicked', () => {
      const quitFn = vi.fn();
      callbacks.quit = quitFn;
      const { tm, deps } = createTrayManager();
      tm.createTray();

      const template = (deps.Menu.buildFromTemplate as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const quitItem = template.find((item: { label?: string }) => item.label === 'Quit');
      quitItem.click();

      expect(quitFn).toHaveBeenCalled();
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
