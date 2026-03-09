import type { Shell } from 'electron';
import { AUTH_DOMAINS } from './constants';

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

export function createWindowOpenHandler(shell: Shell) {
  return ({ url }: { url: string }): { action: 'allow' | 'deny' } => {
    try {
      const parsedUrl = new URL(url);

      if (AUTH_DOMAINS.has(parsedUrl.hostname)) {
        return { action: 'allow' };
      }

      if (ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
        void shell.openExternal(url);
      } else {
        console.warn(`[security] Blocked attempt to open external URL with disallowed protocol: ${url}`);
      }
    } catch (error) {
      console.warn(`[security] Failed to parse URL for external open: ${url}`, error);
    }
    return { action: 'deny' };
  };
}
