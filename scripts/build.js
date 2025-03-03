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

// Configuration
const submodules = ['main_page', 'art-appraisers-landing'];
const rootDistDir = path.resolve(__dirname, '../dist');

console.log(chalk.blue('🚀 Starting monorepo build process...\n'));

// Ensure the root dist directory exists and is empty
console.log(chalk.yellow('Preparing dist directory...'));
if (fs.existsSync(rootDistDir)) {
  fs.removeSync(rootDistDir);
}
fs.ensureDirSync(rootDistDir);

// Create main_page dist directory
fs.ensureDirSync(path.join(rootDistDir, 'main_page'));
fs.ensureDirSync(path.join(rootDistDir, 'main_page', 'dist'));

// Create art-appraisers-landing dist directory
fs.ensureDirSync(path.join(rootDistDir, 'art-appraisers-landing'));
fs.ensureDirSync(path.join(rootDistDir, 'art-appraisers-landing', 'dist'));

// Root index file that redirects to main page
fs.writeFileSync(
  path.join(rootDistDir, 'index.html'),
  `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=/main_page/dist/index.html">
    <title>Appraisily</title>
  </head>
  <body>
    Redirecting to <a href="/main_page/dist/index.html">main site</a>...
  </body>
</html>`
);

// Build each submodule
for (const submodule of submodules) {
  console.log(chalk.yellow(`\nBuilding ${submodule}...`));

  try {
    // Run the build command in the submodule directory
    execSync('npm run build', {
      cwd: path.resolve(__dirname, '..', submodule),
      stdio: 'inherit',
    });

    console.log(chalk.green(`✅ ${submodule} built successfully`));

    // Copy built files to the consolidated dist directory
    const submoduleDistDir = path.resolve(__dirname, '..', submodule, 'dist');
    const targetDir = path.join(rootDistDir, submodule, 'dist');

    if (fs.existsSync(submoduleDistDir)) {
      console.log(chalk.yellow(`Copying ${submodule} dist files...`));
      fs.copySync(submoduleDistDir, targetDir);

      // Fix the asset paths in the HTML files
      const htmlFilePath = path.join(targetDir, 'index.html');
      if (fs.existsSync(htmlFilePath)) {
        console.log(chalk.yellow(`Fixing asset paths in ${submodule}/dist/index.html...`));
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

        // Replace absolute paths with relative paths
        htmlContent = htmlContent.replace(/src="\/assets\//g, `src="${submodule}/dist/assets/`);
        htmlContent = htmlContent.replace(/href="\/assets\//g, `href="${submodule}/dist/assets/`);

        fs.writeFileSync(htmlFilePath, htmlContent);
      }
    } else {
      console.error(chalk.red(`❌ ${submodule} dist directory not found!`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`❌ Failed to build ${submodule}`));
    console.error(error);
    process.exit(1);
  }
}

// Create _redirects file for Netlify
console.log(chalk.yellow('\nCreating Netlify redirects file...'));
fs.writeFileSync(
  path.join(rootDistDir, '_redirects'),
  `# Main Page Routes - Keep at root
/                           /main_page/dist/index.html           200
/main_page/dist/assets/*    /main_page/dist/assets/:splat        200
/assets/*                   /main_page/dist/assets/:splat        200

# Art Appraisers Landing Routes
/art-appraisers/*           /art-appraisers-landing/dist/index.html    200
/art-appraisers/assets/*    /art-appraisers-landing/dist/assets/:splat 200
/art-appraisers-landing/dist/assets/*  /art-appraisers-landing/dist/assets/:splat 200
/painting-value/*           /art-appraisers-landing/dist/index.html    200

# Test Submodule Routes (if enabled)
/test-submodule/*           /test-submodule/dist/index.html    200
/test-submodule/assets/*    /test-submodule/dist/assets/:splat 200

# Handle fallback for client-side routing
/*                          /main_page/dist/index.html           200
`
);

console.log(chalk.green('\n✨ Monorepo build completed successfully!'));
console.log(chalk.blue('Deployment artifacts available in the dist directory'));

// Instructions for testing locally
console.log(chalk.yellow('\nTo test locally:'));
console.log('npx serve -s dist');

// Exit with success code
process.exit(0);
