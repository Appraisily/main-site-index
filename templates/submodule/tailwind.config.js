/** @type {import('tailwindcss').Config} */
const baseConfig = require('../shared/styles/tailwind.config.base');

export default {
  // Extend the base config
  ...baseConfig,
  // Add content paths specific to this submodule
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../shared/components/**/*.{js,ts,jsx,tsx}',
  ],
  // Override or add submodule-specific customizations here
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Submodule-specific theme extensions go here
    },
  },
}; 