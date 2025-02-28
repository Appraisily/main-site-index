/**
 * Build script that coordinates image generation and directory build
 * 
 * Usage: node scripts/build-with-images.js
 * 
 * This script:
 * 1. Identifies appraisers without images
 * 2. Generates images for those appraisers
 * 3. Builds the art-appraiser-directory with the updated images
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
  // Control whether to actually generate images or just simulate
  generateImages: true,
  // Maximum number of images to generate in one build (to control costs)
  maxImagesToGenerate: 20
};

/**
 * Run a command and return a promise that resolves when the command completes
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Identify appraisers without images
 */
async function identifyMissingImages() {
  try {
    console.log('\n🔍 STEP 1: Identifying appraisers without images...');
    await runCommand('node', ['scripts/identify-missing-images.js']);
    
    // Check if there are any appraisers without images
    const tempDir = path.join(__dirname, '../temp');
    const appraisersFile = path.join(tempDir, 'appraisers-needing-images.json');
    
    if (await fs.pathExists(appraisersFile)) {
      const data = await fs.readJson(appraisersFile);
      
      if (data.appraisers && data.appraisers.length > 0) {
        console.log(`Found ${data.appraisers.length} appraisers without images.`);
        
        // If we're limiting the number of images to generate
        if (CONFIG.maxImagesToGenerate > 0 && data.appraisers.length > CONFIG.maxImagesToGenerate) {
          console.log(`Limiting to ${CONFIG.maxImagesToGenerate} images per build to control costs.`);
          
          // Create a new file with limited appraisers
          const limitedAppraisers = {
            count: CONFIG.maxImagesToGenerate,
            timestamp: data.timestamp,
            appraisers: data.appraisers.slice(0, CONFIG.maxImagesToGenerate)
          };
          
          await fs.writeJson(appraisersFile, limitedAppraisers, { spaces: 2 });
          console.log(`Limited to ${limitedAppraisers.appraisers.length} appraisers for image generation.`);
          
          return limitedAppraisers.appraisers.length;
        }
        
        return data.appraisers.length;
      } else {
        console.log('No appraisers need images.');
        return 0;
      }
    } else {
      console.log('No appraisers need images or file not found.');
      return 0;
    }
  } catch (error) {
    console.error('Error identifying missing images:', error);
    return 0;
  }
}

/**
 * Generate images for appraisers without images
 */
async function generateImages(count) {
  try {
    if (count === 0) {
      console.log('No images to generate. Skipping image generation step.');
      return true;
    }
    
    if (!CONFIG.generateImages) {
      console.log('Image generation is disabled. Skipping image generation step.');
      return true;
    }
    
    console.log(`\n🖼️ STEP 2: Generating ${count} appraiser images...`);
    await runCommand('node', ['scripts/generate-appraiser-images.js']);
    console.log('Image generation complete.');
    return true;
  } catch (error) {
    console.error('Error generating images:', error);
    // Continue with build even if image generation fails
    console.log('Continuing with build despite image generation failure.');
    return false;
  }
}

/**
 * Build the art-appraiser-directory
 */
async function buildDirectory() {
  try {
    console.log('\n🏗️ STEP 3: Building art-appraiser-directory...');
    
    // First install dependencies
    console.log('Installing dependencies for art-appraiser-directory...');
    await runCommand('npm', ['install'], { 
      cwd: path.join(__dirname, '../art-appraiser-directory-frontend') 
    });
    
    // Then build
    console.log('Building art-appraiser-directory...');
    await runCommand('npm', ['run', 'build'], { 
      cwd: path.join(__dirname, '../art-appraiser-directory-frontend') 
    });
    
    console.log('✅ art-appraiser-directory built successfully.');
    return true;
  } catch (error) {
    console.error('Error building art-appraiser-directory:', error);
    return false;
  }
}

/**
 * Main function to orchestrate the build process
 */
async function main() {
  try {
    console.log('🚀 Starting build process with image generation...');
    console.log('===============================================');
    
    // Step 1: Identify missing images
    const count = await identifyMissingImages();
    
    // Step 2: Generate images
    await generateImages(count);
    
    // Step 3: Build directory
    await buildDirectory();
    
    console.log('===============================================');
    console.log('✅ Build process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build process failed:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 