/**
 * Base Tailwind CSS configuration for Appraisily
 * 
 * This file contains shared Tailwind configuration that should be used
 * across all submodules to ensure consistent styling.
 * 
 * Usage in a submodule:
 * ```
 * const baseConfig = require('../shared/styles/tailwind.config.base');
 * module.exports = {
 *   // Extend the base config
 *   ...baseConfig,
 *   // Override or add submodule-specific configuration
 *   content: [
 *     './src/**/*.{js,jsx,ts,tsx}',
 *     '../shared/components/**/*.{js,jsx,ts,tsx}'
 *   ],
 * };
 * ```
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#f5f8ff',
          100: '#e6effe',
          200: '#d5e3fe',
          300: '#b3cffe',
          400: '#85aefa',
          500: '#598df8',
          600: '#3d6ff0',
          700: '#2f58da',
          800: '#2c49b2',
          900: '#29418c',
          950: '#1c2a53',
        },
        secondary: {
          50: '#f3f9fa',
          100: '#dff0f3',
          200: '#c0e3e9',
          300: '#90cdd8',
          400: '#58b1c3',
          500: '#3a96a9',
          600: '#307a8d',
          700: '#2d6373',
          800: '#2b5260',
          900: '#294551',
          950: '#162c36',
        },
        accent: {
          50: '#fcf5ff',
          100: '#f7e9ff',
          200: '#f0d6ff',
          300: '#e7b6ff',
          400: '#d884ff',
          500: '#c654ff',
          600: '#b62cf7',
          700: '#a01dd3',
          800: '#851dab',
          900: '#6d1c89',
          950: '#470e59',
        },
        // Semantic colors
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        mono: [
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--text-primary)',
            a: {
              color: 'var(--color-primary-600)',
              '&:hover': {
                color: 'var(--color-primary-700)',
              },
            },
            'h1, h2, h3, h4': {
              color: 'var(--text-primary)',
              fontWeight: '700',
            },
          },
        },
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 