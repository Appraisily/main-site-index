const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the router file in the art-appraiser-directory-frontend submodule
const routerFilePath = path.resolve(
  __dirname, 
  '../art-appraiser-directory-frontend/src/router.tsx'
);

function applyRouterPathFix() {
  console.log('Applying router basename fix to art-appraiser-directory-frontend...');

  try {
    // Read the current router file
    let routerContent = fs.readFileSync(routerFilePath, 'utf8');
    
    // Replace the basename value
    routerContent = routerContent.replace(
      /basename: '\/'/g, 
      "basename: '/directory'"
    );
    
    // Write the updated content back
    fs.writeFileSync(routerFilePath, routerContent);
    
    console.log('Successfully updated router basename');
  } catch (error) {
    console.error('Error updating router basename:', error);
    process.exit(1);
  }
}

// Apply all patches
function applyPatches() {
  try {
    applyRouterPathFix();
    console.log('All patches applied successfully');
  } catch (error) {
    console.error('Error applying patches:', error);
    process.exit(1);
  }
}

applyPatches(); 