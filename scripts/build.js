#!/usr/bin/env node

/**
 * Build script for Appraisily monorepo
 *
 * This script:
 * 1. Builds all submodules
 * 2. Consolidates their dist directories into the root dist directory
 * 3. Ensures proper path mappings for Netlify deployment
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Path configurations
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const mainPageDir = path.resolve(rootDir, 'main_page');
const artAppraisersDir = path.resolve(rootDir, 'art-appraisers-landing');
const mainPageDistDir = path.resolve(mainPageDir, 'dist');
const artAppraisersDistDir = path.resolve(artAppraisersDir, 'dist');

// Ensure the dist directory exists and is empty
console.log(chalk.blue('🚀 Starting build process...'));
console.log(chalk.blue('Preparing dist directory...'));
fs.ensureDirSync(distDir);
fs.emptyDirSync(distDir);

// Build main_page
console.log(chalk.blue('\nBuilding main_page...'));
process.chdir(mainPageDir);
execSync('npm run build', { stdio: 'inherit' });

// Build art-appraisers-landing
console.log(chalk.blue('\nBuilding art-appraisers-landing...'));
process.chdir(artAppraisersDir);
execSync('npm run build', { stdio: 'inherit' });

// Copy main_page files to dist (root)
console.log(chalk.blue('\nCopying main_page files to root of dist...'));
fs.copySync(mainPageDistDir, distDir);

// Copy art-appraisers-landing files to dist/art-appraisers-landing
console.log(chalk.blue('\nCopying art-appraisers-landing files to dist/art-appraisers-landing...'));
fs.copySync(artAppraisersDistDir, path.resolve(distDir, 'art-appraisers-landing'));

// Create _redirects file for Netlify
console.log(chalk.blue('\nCreating Netlify redirects...'));
const redirects = [
  '/art-landing/* /art-appraisers-landing/:splat 200',
  '/* /index.html 200'
];
fs.writeFileSync(path.resolve(distDir, '_redirects'), redirects.join('\n'));

console.log(chalk.green('\n✨ Build completed successfully!'));
console.log(chalk.green('Ready for Netlify deployment'));

// Exit with success code
process.exit(0);
