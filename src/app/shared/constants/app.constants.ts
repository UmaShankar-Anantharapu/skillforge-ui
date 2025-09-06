// Application-wide constants to replace magic numbers and hardcoded values

export const APP_CONSTANTS = {
  // Scroll and Animation
  SCROLL_AMOUNT: 300,
  SCROLL_UPDATE_DELAY: 300,
  ANIMATION_DURATION: {
    SHORT: 150,
    MEDIUM: 200,
    LONG: 300
  },

  // Timeouts and Intervals
  POLLING_INTERVAL: {
    FAST: 3000,
    NORMAL: 5000,
    SLOW: 10000
  },

  // UI Dimensions
  ICON_SIZES: {
    SMALL: 14,
    MEDIUM: 16,
    LARGE: 20,
    EXTRA_LARGE: 24
  },

  // Z-Index Layers
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 2000,
    TOOLTIP: 10000
  },

  // Form Validation
  AGE_LIMITS: {
    MIN: 16,
    MAX: 100
  },

  // Progress and Scoring
  PROGRESS: {
    COMPLETE: 100,
    INCOMPLETE: 0
  },

  // Character Limits
  CHARACTER_LIMITS: {
    SUMMARY: 500,
    NOTIFICATION_ID: 1000
  },

  // Grid Layout
  GRID: {
    COLUMNS: 3,
    NODE_SPACING_X: 200,
    NODE_SPACING_Y: 150,
    OFFSET_X: 100,
    OFFSET_Y: 100
  },

  // Font Weights
  FONT_WEIGHT: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMI_BOLD: 600
  },

  // API Endpoints (fallback values)
  API: {
    DEFAULT_PORT: 5000,
    ANALYTICS_PORT: 5050,
    LOCALHOST: 'http://localhost'
  },

  // External URLs
  EXTERNAL_URLS: {
    COURSERA_SEARCH: 'https://www.coursera.org/search?query=',
    LINKEDIN_BASE: 'https://linkedin.com/in/',
    GITHUB_BASE: 'https://github.com/',
    HTTPS_PREFIX: 'https://'
  }
};

// Theme-related constants
export const THEME_CONSTANTS = {
  DIFFICULTY_COLORS: {
    BEGINNER: {
      DARK: 'text-green-400',
      LIGHT: 'text-green-600'
    },
    INTERMEDIATE: {
      DARK: 'text-yellow-400',
      LIGHT: 'text-yellow-600'
    },
    ADVANCED: {
      DARK: 'text-red-400',
      LIGHT: 'text-red-600'
    },
    DEFAULT: 'text-gray-500'
  }
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  URL: /^https?:\/\//,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};