/**
 * Timing constants for debouncing and animations
 */
export const TIMING = {
  /**
   * Debounce delay for layout save operations (ms)
   */
  LAYOUT_SAVE_DEBOUNCE: 500,

  /**
   * Debounce delay for search input (ms)
   */
  SEARCH_DEBOUNCE: 300,

  /**
   * Debounce delay for window resize events (ms)
   */
  RESIZE_DEBOUNCE: 150,

  /**
   * Animation duration for transitions (ms)
   */
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,

  /**
   * Auto-save interval for forms (ms)
   */
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
} as const;
