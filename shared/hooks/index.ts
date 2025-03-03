/**
 * Shared React Hooks
 * 
 * This file exports custom React hooks that can be used across submodules.
 * Import hooks from this file to ensure proper organization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A hook that provides a boolean state that can be toggled
 * 
 * @param initialState - Initial boolean state
 * @returns An array containing the state and functions to toggle, set true, and set false
 */
export function useToggle(initialState: boolean = false) {
  const [state, setState] = useState<boolean>(initialState);
  
  const toggle = useCallback(() => setState(state => !state), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  
  return [state, toggle, setTrue, setFalse] as const;
}

/**
 * A hook that provides a value from localStorage that stays in sync
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns An array containing the value and a function to set it
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}

/**
 * A hook that provides a debounced version of a value
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * A hook that executes a callback when the user clicks outside of the referenced element
 * 
 * @param callback - Function to call when a click outside occurs
 * @returns A ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);
  
  return ref;
}

/**
 * A hook that provides a way to know if the component is mounted
 * Useful to prevent memory leaks with async operations
 * 
 * @returns A ref object with a current value of true if mounted, undefined if not
 */
export function useIsMounted() {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
} 