const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

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
    
    // Inject Google Tag Manager code into all HTML files
    console.log('Injecting Google Tag Manager code into HTML files...');
    await injectGoogleTagManager();
    
    console.log('Build merge completed successfully!');
  } catch (error) {
    console.error('Error merging builds:', error);
    process.exit(1);
  }
}

// Function to inject Google Tag Manager code into all HTML files
async function injectGoogleTagManager() {
  try {
    // Find all HTML files in the output directory
    const htmlFiles = glob.sync(`${outputPath}/**/*.html`);
    console.log(`Found ${htmlFiles.length} HTML files for GTM injection`);
    
    // GTM head script
    const gtmHeadScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PSLHDGM');</script>
<!-- End Google Tag Manager -->`;

    // GTM body script
    const gtmBodyScript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PSLHDGM"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

    // Process each HTML file
    let injectedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const filePath of htmlFiles) {
      try {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = false;
        
        // Check if file has HTML structure
        if (!content.includes('</head>') || !content.match(/<body[^>]*>/)) {
          console.warn(`Skipping ${filePath} - not a standard HTML file`);
          skippedCount++;
          continue;
        }
        
        // Add GTM head script if not already present
        if (!content.includes('googletagmanager.com/gtm.js')) {
          content = content.replace('</head>', `${gtmHeadScript}\n</head>`);
          modified = true;
        }
        
        // Add GTM body script if not already present
        if (!content.includes('googletagmanager.com/ns.html')) {
          // Handle body tags with attributes
          if (content.match(/<body[^>]*>/)) {
            content = content.replace(/<body[^>]*>/, match => `${match}\n${gtmBodyScript}`);
            modified = true;
          } else {
            console.warn(`No body tag found in ${filePath}`);
            skippedCount++;
          }
        }
        
        if (modified) {
          await fs.writeFile(filePath, content);
          injectedCount++;
        } else {
          console.log(`GTM already present in ${path.basename(filePath)}`);
          skippedCount++;
        }
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`Google Tag Manager injection summary:`);
    console.log(`- Injected into ${injectedCount} HTML files`);
    console.log(`- Skipped ${skippedCount} files (already present or not applicable)`);
    console.log(`- Errors in ${errorCount} files`);
  } catch (error) {
    console.error('Error injecting Google Tag Manager:', error);
  }
}

mergeBuilds(); 