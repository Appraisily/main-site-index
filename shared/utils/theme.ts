/**
 * Theme utilities for managing dark mode and theme preferences
 */

// Theme types for strong typing
export type Theme = 'light' | 'dark' | 'system';

/**
 * Checks if the user prefers dark mode based on system preferences
 * 
 * @returns boolean indicating if dark mode is preferred
 */
export function getSystemThemePreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Sets the theme based on the provided theme value or system preference
 * 
 * @param theme - The theme to set ('light', 'dark', or 'system')
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  // Remove both classes first
  root.classList.remove('light-mode', 'dark-mode');
  
  // Determine which theme to apply
  const isDark = theme === 'system' 
    ? getSystemThemePreference() 
    : theme === 'dark';
  
  // Add the appropriate class
  root.classList.add(isDark ? 'dark-mode' : 'light-mode');
  
  // Store the theme preference
  try {
    localStorage.setItem('appraisily-theme', theme);
  } catch (error) {
    console.warn('Failed to save theme preference to localStorage:', error);
  }
}

/**
 * Gets the current theme preference from localStorage or defaults to system
 * 
 * @returns The current theme preference
 */
export function getThemePreference(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const storedTheme = localStorage.getItem('appraisily-theme') as Theme | null;
    return storedTheme || 'system';
  } catch (error) {
    console.warn('Failed to read theme preference from localStorage:', error);
    return 'system';
  }
}

/**
 * Initializes theme based on stored preference or system setting
 * Should be called once when the application loads
 */
export function initializeTheme(): void {
  const theme = getThemePreference();
  setTheme(theme);
  
  // Set up listener for system preference changes if using system preference
  if (theme === 'system' && typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (getThemePreference() === 'system') {
        setTheme('system');
      }
    };
    
    // Add event listener with compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * Hook to toggle between light and dark mode
 * If current theme is system, it will first change to the opposite of the system preference
 * 
 * @returns The new theme after toggling
 */
export function toggleTheme(): Theme {
  const currentTheme = getThemePreference();
  let newTheme: Theme;
  
  if (currentTheme === 'system') {
    // If using system preference, switch to the opposite of what the system is using
    newTheme = getSystemThemePreference() ? 'light' : 'dark';
  } else {
    // Otherwise just toggle between light and dark
    newTheme = currentTheme === 'light' ? 'dark' : 'light';
  }
  
  setTheme(newTheme);
  return newTheme;
} 