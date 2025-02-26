const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the router file in the art-appraiser-directory-frontend submodule
const directoryRouterFilePath = path.resolve(
  __dirname, 
  '../art-appraiser-directory-frontend/src/router.tsx'
);

// Path to the main.tsx file in the art-appraisers-landing submodule
const landingMainFilePath = path.resolve(
  __dirname,
  '../art-appraisers-landing/src/main.tsx'
);

// Path to the main.tsx file in the screener-page-module submodule
const screenerMainFilePath = path.resolve(
  __dirname,
  '../screener-page-module/src/main.tsx'
);

function applyDirectoryRouterPathFix() {
  console.log('Applying router basename fix to art-appraiser-directory-frontend...');

  try {
    // Read the current router file
    let routerContent = fs.readFileSync(directoryRouterFilePath, 'utf8');
    
    // Replace the basename value
    routerContent = routerContent.replace(
      /basename: '\/'/g, 
      "basename: '/directory'"
    );
    
    // Write the updated content back
    fs.writeFileSync(directoryRouterFilePath, routerContent);
    
    console.log('Successfully updated directory router basename');
  } catch (error) {
    console.error('Error updating directory router basename:', error);
    process.exit(1);
  }
}

function applyLandingRouterPathFix() {
  console.log('Applying router basename fix to art-appraisers-landing...');

  try {
    // Read the current main.tsx file
    let mainContent = fs.readFileSync(landingMainFilePath, 'utf8');
    
    // Replace the BrowserRouter with a BrowserRouter with basename
    mainContent = mainContent.replace(
      /<BrowserRouter>/g,
      "<BrowserRouter basename='/landing'>"
    );
    
    // Write the updated content back
    fs.writeFileSync(landingMainFilePath, mainContent);
    
    console.log('Successfully updated landing router basename');
  } catch (error) {
    console.error('Error updating landing router basename:', error);
    process.exit(1);
  }
}

function applyScreenerRouterPathFix() {
  console.log('Applying router basename fix to screener-page-module...');

  try {
    // Read the current main.tsx file
    let mainContent = fs.readFileSync(screenerMainFilePath, 'utf8');
    
    // Replace the BrowserRouter with a BrowserRouter with basename
    mainContent = mainContent.replace(
      /<BrowserRouter>/g,
      "<BrowserRouter basename='/screener'>"
    );
    
    // Write the updated content back
    fs.writeFileSync(screenerMainFilePath, mainContent);
    
    console.log('Successfully updated screener router basename');
  } catch (error) {
    console.error('Error updating screener router basename:', error);
    process.exit(1);
  }
}

// Apply all patches
function applyPatches() {
  try {
    applyDirectoryRouterPathFix();
    applyLandingRouterPathFix();
    applyScreenerRouterPathFix();
    console.log('All patches applied successfully');
  } catch (error) {
    console.error('Error applying patches:', error);
    process.exit(1);
  }
}

applyPatches(); 