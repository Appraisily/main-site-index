#!/usr/bin/env node

/**
 * Postinstall script for Appraisily monorepo
 * 
 * This script:
 * 1. Ensures all shared directories exist
 * 2. Creates necessary symbolic links for shared modules
 * 3. Verifies submodule structure
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Running Appraisily monorepo postinstall setup...\n'));

// Define shared directories that need to exist
const sharedDirs = [
  'shared/components',
  'shared/styles',
  'shared/utils',
  'shared/types',
  'shared/hooks',
  'shared/assets',
  'shared/config'
];

// Ensure shared directories exist
console.log(chalk.yellow('Ensuring shared directories exist...'));
sharedDirs.forEach(dir => {
  const dirPath = path.resolve(__dirname, '..', dir);
  fs.ensureDirSync(dirPath);
  console.log(`  ✓ ${dir}`);
});

// Create index files if they don't exist
console.log(chalk.yellow('\nChecking for index files in shared directories...'));

// Add index.js to shared/utils if it doesn't exist
const utilsIndexPath = path.resolve(__dirname, '../shared/utils/index.js');
if (!fs.existsSync(utilsIndexPath)) {
  console.log('  ✓ Creating shared/utils/index.js');
  fs.writeFileSync(utilsIndexPath, `/**
 * Shared utility functions
 * 
 * This file re-exports all utility functions categorized by their functionality.
 * Import all utilities from this file to ensure proper organization.
 */

// Re-export utilities by category
export * from './api';
export * from './formatting';
export * from './validation';

// More utility exports will be added as they are developed
`);
}

// Add index.ts to shared/types if it doesn't exist
const typesIndexPath = path.resolve(__dirname, '../shared/types/index.ts');
if (!fs.existsSync(typesIndexPath)) {
  console.log('  ✓ Creating shared/types/index.ts');
  fs.writeFileSync(typesIndexPath, `/**
 * Shared TypeScript type definitions
 * 
 * This file re-exports all type definitions used throughout the application.
 * Import all types from this file to ensure proper organization.
 */

// Re-export all models
export * from './models';

// More type exports will be added as they are developed
`);
}

// Add index.js to shared/components if it doesn't exist
const componentsIndexPath = path.resolve(__dirname, '../shared/components/index.js');
if (!fs.existsSync(componentsIndexPath)) {
  console.log('  ✓ Creating shared/components/index.js');
  fs.writeFileSync(componentsIndexPath, `/**
 * Shared UI components
 * 
 * This file re-exports all shared components used across submodules.
 * Import components from this file to ensure proper organization.
 */

// Re-export components
export { Button } from './Button';

// More component exports will be added as they are developed
`);
}

// Check for submodules
console.log(chalk.yellow('\nVerifying submodule setup...'));
const submodules = ['main_page', 'art-appraisers-landing'];
submodules.forEach(submodule => {
  const submodulePath = path.resolve(__dirname, '..', submodule);
  if (fs.existsSync(submodulePath)) {
    console.log(`  ✓ ${submodule} submodule found`);
  } else {
    console.log(chalk.red(`  ✗ ${submodule} submodule not found. Please run 'git submodule update --init --recursive'`));
  }
});

console.log(chalk.green('\n✅ Postinstall setup completed successfully!'));
console.log(chalk.blue('Your Appraisily monorepo is ready for development.')); 