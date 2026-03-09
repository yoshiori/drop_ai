import { describe, it, expect } from 'vitest';
import {
  WINDOW_HEIGHT_RATIO,
  ANIMATION_STEPS,
  ANIMATION_INTERVAL_MS,
  GEMINI_URL,
  DEV_SERVER_URL,
} from '../constants';

describe('constants', () => {
  it('WINDOW_HEIGHT_RATIO should be between 0 and 1', () => {
    expect(WINDOW_HEIGHT_RATIO).toBeGreaterThan(0);
    expect(WINDOW_HEIGHT_RATIO).toBeLessThanOrEqual(1);
  });

  it('ANIMATION_STEPS should be a positive integer', () => {
    expect(ANIMATION_STEPS).toBeGreaterThan(0);
    expect(Number.isInteger(ANIMATION_STEPS)).toBe(true);
  });

  it('ANIMATION_INTERVAL_MS should be a positive number', () => {
    expect(ANIMATION_INTERVAL_MS).toBeGreaterThan(0);
  });

  it('GEMINI_URL should be a valid https URL', () => {
    expect(GEMINI_URL).toMatch(/^https:\/\//);
  });

  it('DEV_SERVER_URL should be a localhost URL', () => {
    expect(DEV_SERVER_URL).toMatch(/^http:\/\/localhost/);
  });
});
