const fs = require('fs-extra');
const path = require('path');

// Define paths
const mainBuildPath = path.resolve(__dirname, '../main_page/dist');
const directoryBuildPath = path.resolve(__dirname, '../art-appraiser-directory-frontend/dist');
const landingBuildPath = path.resolve(__dirname, '../art-appraisers-landing/dist');
const screenerBuildPath = path.resolve(__dirname, '../screener-page-module/dist');
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
    
    // Create landing folder for the landing pages
    const landingOutputPath = path.join(outputPath, 'landing');
    await fs.ensureDir(landingOutputPath);
    
    // Copy landing app build into landing folder
    console.log('Copying landing app build...');
    await fs.copy(landingBuildPath, landingOutputPath);
    
    // Create screener folder for the screener pages
    const screenerOutputPath = path.join(outputPath, 'screener');
    await fs.ensureDir(screenerOutputPath);
    
    // Copy screener app build into screener folder
    console.log('Copying screener app build...');
    await fs.copy(screenerBuildPath, screenerOutputPath);
    
    // Update paths in directory app index.html to use /directory as base path
    const directoryIndexPath = path.join(directoryOutputPath, 'index.html');
    if (await fs.pathExists(directoryIndexPath)) {
      let indexContent = await fs.readFile(directoryIndexPath, 'utf8');
      
      // Update asset paths to include /directory prefix
      indexContent = indexContent.replace(/(src|href)="\/(assets|index|vite)([^"]*)"/g, '$1="/directory/$2$3"');
      
      await fs.writeFile(directoryIndexPath, indexContent);
      console.log('Updated directory app index.html with correct base path');
    }
    
    // Update paths in landing app index.html to use /landing as base path
    const landingIndexPath = path.join(landingOutputPath, 'index.html');
    if (await fs.pathExists(landingIndexPath)) {
      let indexContent = await fs.readFile(landingIndexPath, 'utf8');
      
      // Update asset paths to include /landing prefix
      indexContent = indexContent.replace(/(src|href)="\/(assets|index|vite)([^"]*)"/g, '$1="/landing/$2$3"');
      
      await fs.writeFile(landingIndexPath, indexContent);
      console.log('Updated landing app index.html with correct base path');
    }
    
    // Update paths in screener app index.html to use /screener as base path
    const screenerIndexPath = path.join(screenerOutputPath, 'index.html');
    if (await fs.pathExists(screenerIndexPath)) {
      let indexContent = await fs.readFile(screenerIndexPath, 'utf8');
      
      // Update asset paths to include /screener prefix
      indexContent = indexContent.replace(/(src|href)="\/(assets|index|vite)([^"]*)"/g, '$1="/screener/$2$3"');
      
      await fs.writeFile(screenerIndexPath, indexContent);
      console.log('Updated screener app index.html with correct base path');
    }
    
    console.log('Build merge completed successfully!');
  } catch (error) {
    console.error('Error merging builds:', error);
    process.exit(1);
  }
}

mergeBuilds(); 