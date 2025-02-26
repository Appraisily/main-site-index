const fs = require('fs-extra');
const path = require('path');

// Define paths
const mainBuildPath = path.resolve(__dirname, '../main_page/dist');
const directoryBuildPath = path.resolve(__dirname, '../art-appraiser-directory-frontend/dist');
const outputPath = path.resolve(__dirname, '../dist');

async function mergeBuilds() {
  try {
    console.log('Starting build merge process...');
    
    // Ensure output directory is empty
    await fs.emptyDir(outputPath);
    console.log('Output directory cleared');
    
    // Copy main site build
    console.log('Copying main site build...');
    await fs.copy(mainBuildPath, outputPath);
    
    // Create directory folder for the directory app
    const directoryOutputPath = path.join(outputPath, 'directory');
    await fs.ensureDir(directoryOutputPath);
    
    // Copy directory app build into directory folder
    console.log('Copying directory app build...');
    await fs.copy(directoryBuildPath, directoryOutputPath);
    
    // Update paths in directory app index.html to use /directory as base path
    const indexPath = path.join(directoryOutputPath, 'index.html');
    if (await fs.pathExists(indexPath)) {
      let indexContent = await fs.readFile(indexPath, 'utf8');
      
      // Update asset paths to include /directory prefix
      indexContent = indexContent.replace(/(src|href)="\/(assets|index|vite)([^"]*)"/g, '$1="/directory/$2$3"');
      
      await fs.writeFile(indexPath, indexContent);
      console.log('Updated directory app index.html with correct base path');
    }
    
    console.log('Build merge completed successfully!');
  } catch (error) {
    console.error('Error merging builds:', error);
    process.exit(1);
  }
}

mergeBuilds(); 