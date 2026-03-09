import { describe, it, expect } from 'vitest';
import { buildMenuTemplate, MENU_IDS } from '../menuBuilder';

describe('buildMenuTemplate', () => {
  it('should return an array of menu items', () => {
    const template = buildMenuTemplate('linux');
    expect(Array.isArray(template)).toBe(true);
    expect(template.length).toBeGreaterThan(0);
  });

  it('should include File, Edit, View, Window menus', () => {
    const template = buildMenuTemplate('linux');
    const labels = template.map((item) => item.label);
    expect(labels).toContain('File');
    expect(labels).toContain('Edit');
    expect(labels).toContain('View');
    expect(labels).toContain('Window');
  });

  it('should assign stable IDs to File menu items', () => {
    const template = buildMenuTemplate('linux');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const ids = submenu.map((item) => item.id).filter(Boolean);
    expect(ids).toContain(MENU_IDS.TOGGLE_WINDOW);
    expect(ids).toContain(MENU_IDS.NEW_CHAT);
    expect(ids).toContain(MENU_IDS.RELOAD);
    expect(ids).toContain(MENU_IDS.HIDE_WINDOW);
    expect(ids).toContain(MENU_IDS.QUIT);
  });

  it('should have Toggle Window with F12 accelerator in File menu', () => {
    const template = buildMenuTemplate('linux');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const toggleItem = submenu.find((item) => item.id === MENU_IDS.TOGGLE_WINDOW);
    expect(toggleItem?.accelerator).toBe('F12');
  });

  it('should have Quit with Ctrl+Q on non-darwin platforms', () => {
    const template = buildMenuTemplate('linux');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const quitItem = submenu.find((item) => item.id === MENU_IDS.QUIT);
    expect(quitItem?.accelerator).toBe('Ctrl+Q');
  });

  it('should have Quit with Cmd+Q on darwin', () => {
    const template = buildMenuTemplate('darwin');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const quitItem = submenu.find((item) => item.id === MENU_IDS.QUIT);
    expect(quitItem?.accelerator).toBe('Cmd+Q');
  });

  it('should prepend app menu on darwin', () => {
    const template = buildMenuTemplate('darwin', 'DropAI');
    expect(template[0].label).toBe('DropAI');
    const submenu = template[0].submenu as Electron.MenuItemConstructorOptions[];
    const roles = submenu.map((item) => item.role).filter(Boolean);
    expect(roles).toContain('about');
    expect(roles).toContain('quit');
  });

  it('should not have app menu on non-darwin platforms', () => {
    const template = buildMenuTemplate('linux');
    expect(template[0].label).not.toBe('DropAI');
    expect(template[0].label).toBe('File');
  });

  it('should include New Chat with CmdOrCtrl+N', () => {
    const template = buildMenuTemplate('linux');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const newChat = submenu.find((item) => item.id === MENU_IDS.NEW_CHAT);
    expect(newChat?.accelerator).toBe('CmdOrCtrl+N');
  });

  it('should include Hide Window with Escape', () => {
    const template = buildMenuTemplate('linux');
    const fileMenu = template.find((item) => item.label === 'File');
    const submenu = fileMenu?.submenu as Electron.MenuItemConstructorOptions[];
    const hideItem = submenu.find((item) => item.id === MENU_IDS.HIDE_WINDOW);
    expect(hideItem?.accelerator).toBe('Escape');
  });
});
