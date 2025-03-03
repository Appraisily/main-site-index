/**
 * Shared utility functions
 * 
 * This file re-exports all utility functions categorized by their functionality.
 * Import all utilities from this file to ensure proper organization.
 */

// Re-export utilities by category
export * from './api';
export * from './formatting';
export * from './validation';
export * from './theme';
export { default as eventBus } from './eventBus';

// More utility exports will be added as they are developed 