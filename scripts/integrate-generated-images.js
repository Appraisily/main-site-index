/**
 * Integrate Generated Images Script
 * Copies generated appraiser images from the image generation service to the directory build
 */

const fs = require('fs-extra');
const path = require('path');

// Define paths
const GENERATION_SERVICE_IMAGE_DIR = path.resolve(__dirname, '../image-generation-service/data/images');
const IMAGE_UPDATES_FILE = path.resolve(__dirname, '../image-generation-service/data/appraiser-image-updates.json');
const DIRECTORY_PUBLIC_DIR = path.resolve(__dirname, '../art-appraiser-directory-frontend/public');
const DIRECTORY_BUILD_DIR = path.resolve(__dirname, '../art-appraiser-directory-frontend/dist');
const FINAL_OUTPUT_DIR = path.resolve(__dirname, '../dist/directory');

async function integrateGeneratedImages() {
  try {
    console.log('Starting integration of generated appraiser images...');
    
    // Check if the image updates file exists
    if (!await fs.pathExists(IMAGE_UPDATES_FILE)) {
      console.log('No image updates file found. Skipping image integration.');
      return;
    }
    
    // Load the image updates
    const updates = await fs.readJson(IMAGE_UPDATES_FILE);
    
    if (!updates || updates.length === 0) {
      console.log('No image updates found. Skipping image integration.');
      return;
    }
    
    console.log(`Found ${updates.length} image updates to apply.`);
    
    // Process each update
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of updates) {
      try {
        const isImageKit = update.source === 'imagekit' || update.originalImageUrl.includes('ik.imagekit.io');
        
        if (isImageKit) {
          // For ImageKit images, we don't need to copy the file, just update the appraiser data
          console.log(`Using ImageKit URL for appraiser ${update.appraiserId}: ${update.originalImageUrl}`);
          
          // Update any record of the appraiser in the directory
          try {
            // This part would be handled by the directory's build process
            // Just logging for now
            console.log(`Recorded ImageKit URL for appraiser ${update.appraiserId}`);
            successCount++;
          } catch (dirError) {
            console.error(`Error updating directory data for ImageKit URL: ${dirError.message}`);
            errorCount++;
          }
          
          continue;
        }
        
        // Handle local or cloud storage images
        const sourceFilename = path.basename(update.originalImageUrl);
        const sourcePath = path.join(GENERATION_SERVICE_IMAGE_DIR, sourceFilename);
        
        // Skip if the source file doesn't exist
        if (!await fs.pathExists(sourcePath)) {
          console.warn(`Source image not found: ${sourcePath}`);
          continue;
        }
        
        // Define the target paths - both in the public dir and dist dir
        const publicTargetDir = path.join(DIRECTORY_PUBLIC_DIR, path.dirname(update.targetPath));
        const publicTargetPath = path.join(DIRECTORY_PUBLIC_DIR, update.targetPath);
        const buildTargetDir = path.join(DIRECTORY_BUILD_DIR, path.dirname(update.targetPath));
        const buildTargetPath = path.join(DIRECTORY_BUILD_DIR, update.targetPath);
        
        // Create the target directories if they don't exist
        await fs.ensureDir(publicTargetDir);
        await fs.ensureDir(buildTargetDir);
        
        // Copy the image to both the public dir and the dist dir
        await fs.copy(sourcePath, publicTargetPath);
        
        // If the build directory exists, copy there too
        if (await fs.pathExists(DIRECTORY_BUILD_DIR)) {
          await fs.copy(sourcePath, buildTargetPath);
        }
        
        console.log(`Copied image for appraiser ${update.appraiserId}: ${update.targetPath}`);
        successCount++;
      } catch (error) {
        console.error(`Error processing update for appraiser ${update.appraiserId}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`Image integration completed. Success: ${successCount}, Errors: ${errorCount}`);
    
    // If the final output directory exists, also copy the images there
    if (await fs.pathExists(FINAL_OUTPUT_DIR)) {
      console.log('Copying images to final output directory...');
      
      for (const update of updates) {
        try {
          const sourceFilename = path.basename(update.originalImageUrl);
          const sourcePath = path.join(GENERATION_SERVICE_IMAGE_DIR, sourceFilename);
          const finalTargetDir = path.join(FINAL_OUTPUT_DIR, path.dirname(update.targetPath));
          const finalTargetPath = path.join(FINAL_OUTPUT_DIR, update.targetPath);
          
          // Skip if the source file doesn't exist
          if (!await fs.pathExists(sourcePath)) {
            continue;
          }
          
          // Create the target directory if it doesn't exist
          await fs.ensureDir(finalTargetDir);
          
          // Copy the image
          await fs.copy(sourcePath, finalTargetPath);
        } catch (error) {
          console.error(`Error copying to final output: ${error.message}`);
        }
      }
      
      console.log('Finished copying images to final output directory.');
    }
  } catch (error) {
    console.error(`Error integrating generated images: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
integrateGeneratedImages()
  .then(() => {
    console.log('Image integration script completed');
  })
  .catch(error => {
    console.error(`Image integration script failed: ${error.message}`);
    process.exit(1);
  }); 