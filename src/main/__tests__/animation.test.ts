import { describe, it, expect } from 'vitest';
import { calculateSlideDownPositions, calculateSlideUpPositions } from '../animation';

describe('calculateSlideDownPositions', () => {
  it('should return positions from -windowHeight to 0', () => {
    const positions = calculateSlideDownPositions(1000, 10);
    expect(positions[0]).toBe(-900);
    expect(positions[positions.length - 1]).toBe(0);
  });

  it('should return exactly the specified number of steps', () => {
    const positions = calculateSlideDownPositions(1000, 20);
    expect(positions).toHaveLength(20);
  });

  it('should produce monotonically increasing values', () => {
    const positions = calculateSlideDownPositions(1080, 20);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1]);
    }
  });

  it('should end at 0 (final position)', () => {
    const positions = calculateSlideDownPositions(648);
    expect(positions[positions.length - 1]).toBe(0);
  });

  it('should use default ANIMATION_STEPS when steps not specified', () => {
    const positions = calculateSlideDownPositions(1000);
    expect(positions).toHaveLength(20);
  });

  it('should handle 1 step', () => {
    const positions = calculateSlideDownPositions(500, 1);
    expect(positions).toHaveLength(1);
    expect(positions[0]).toBe(0);
  });
});

describe('calculateSlideUpPositions', () => {
  it('should return positions from 0 to -windowHeight', () => {
    const positions = calculateSlideUpPositions(1000, 10);
    expect(positions[0]).toBe(-100);
    expect(positions[positions.length - 1]).toBe(-1000);
  });

  it('should return exactly the specified number of steps', () => {
    const positions = calculateSlideUpPositions(1000, 20);
    expect(positions).toHaveLength(20);
  });

  it('should produce monotonically decreasing values', () => {
    const positions = calculateSlideUpPositions(1080, 20);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeLessThanOrEqual(positions[i - 1]);
    }
  });

  it('should end at -windowHeight (final position)', () => {
    const positions = calculateSlideUpPositions(648);
    expect(positions[positions.length - 1]).toBe(-648);
  });

  it('should handle 1 step', () => {
    const positions = calculateSlideUpPositions(500, 1);
    expect(positions).toHaveLength(1);
    expect(positions[0]).toBe(-500);
  });
});
