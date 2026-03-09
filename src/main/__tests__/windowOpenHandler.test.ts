import { describe, it, expect, vi } from 'vitest';
import { createWindowOpenHandler } from '../windowOpenHandler';

function createMockShell() {
  return {
    openExternal: vi.fn(),
  };
}

describe('createWindowOpenHandler', () => {
  it('should allow auth domain URLs to open in-app', () => {
    const shell = createMockShell();
    const handler = createWindowOpenHandler(shell as never);

    const result = handler({ url: 'https://accounts.google.com/o/oauth2/auth?client_id=123' });
    expect(result).toEqual({ action: 'allow' });
    expect(shell.openExternal).not.toHaveBeenCalled();
  });

  it('should deny non-auth https URLs and open them externally', () => {
    const shell = createMockShell();
    const handler = createWindowOpenHandler(shell as never);

    const result = handler({ url: 'https://example.com' });
    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
  });

  it('should deny http URLs and open them externally', () => {
    const shell = createMockShell();
    const handler = createWindowOpenHandler(shell as never);

    const result = handler({ url: 'http://example.com' });
    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).toHaveBeenCalledWith('http://example.com');
  });

  it('should block disallowed protocols without opening externally', () => {
    const shell = createMockShell();
    const handler = createWindowOpenHandler(shell as never);

    const result = handler({ url: 'file:///etc/passwd' });
    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).not.toHaveBeenCalled();
  });

  it('should handle invalid URLs gracefully', () => {
    const shell = createMockShell();
    const handler = createWindowOpenHandler(shell as never);

    const result = handler({ url: 'not-a-valid-url' });
    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).not.toHaveBeenCalled();
  });
});
