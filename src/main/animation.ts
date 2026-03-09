import { ANIMATION_STEPS } from './constants';

/**
 * Calculate Y positions for slide-down animation (show window).
 * Returns array of Y coordinates from -windowHeight to 0.
 */
export function calculateSlideDownPositions(windowHeight: number, steps: number = ANIMATION_STEPS): number[] {
  const positions: number[] = [];

  for (let i = 1; i <= steps; i++) {
    const y = -windowHeight + (windowHeight * i) / steps;
    positions.push(y >= 0 ? 0 : Math.floor(y));
  }

  return positions;
}

/**
 * Calculate Y positions for slide-up animation (hide window).
 * Returns array of Y coordinates from 0 to -windowHeight.
 */
export function calculateSlideUpPositions(windowHeight: number, steps: number = ANIMATION_STEPS): number[] {
  const positions: number[] = [];

  for (let i = 1; i <= steps; i++) {
    const y = -(windowHeight * i) / steps;
    positions.push(y <= -windowHeight ? -windowHeight : Math.floor(y));
  }

  return positions;
}
