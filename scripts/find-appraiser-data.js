/**
 * Script to locate the appraiser data in the repository
 * 
 * Usage: node scripts/find-appraiser-data.js
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function findAppraiserData() {
  try {
    console.log('Searching for appraiser data files...');
    
    // Possible locations where appraiser data might be stored
    const possibleLocations = [
      // Root directory
      './data/appraisers.json',
      
      // Frontend directory
      './art-appraiser-directory-frontend/src/data/appraisers.json',
      './art-appraiser-directory-frontend/public/data/appraisers.json',
      './art-appraiser-directory-frontend/data/appraisers.json',
      
      // Other common locations
      './src/data/appraisers.json',
      './public/data/appraisers.json'
    ];
    
    // Check each possible location
    for (const location of possibleLocations) {
      const fullPath = path.resolve(location);
      if (await fs.pathExists(fullPath)) {
        console.log(`✅ Found appraiser data at: ${location}`);
        
        // Read the file to check its structure
        const data = await fs.readJson(fullPath);
        if (data && data.appraisers && Array.isArray(data.appraisers)) {
          console.log(`The file contains ${data.appraisers.length} appraisers.`);
          
          // Check if any appraisers already have images
          const withImages = data.appraisers.filter(a => a.imageUrl && a.imageUrl.trim() !== '');
          console.log(`${withImages.length} appraisers already have images.`);
          console.log(`${data.appraisers.length - withImages.length} appraisers need images.`);
          
          return {
            path: location,
            fullPath,
            found: true,
            appraiserCount: data.appraisers.length,
            withImagesCount: withImages.length,
            needImagesCount: data.appraisers.length - withImages.length
          };
        } else {
          console.log(`The file doesn't have the expected structure. It might not be appraiser data.`);
        }
      }
    }
    
    // If we haven't found it in common locations, search for any JSON files that might contain "appraisers"
    console.log('Searching for JSON files that might contain appraiser data...');
    
    const jsonFiles = await new Promise((resolve, reject) => {
      glob('**/*.json', { ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] }, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
    
    console.log(`Found ${jsonFiles.length} JSON files in the repository.`);
    
    // Check each JSON file for appraiser data
    let possibleMatchesCount = 0;
    for (const file of jsonFiles) {
      try {
        const data = await fs.readJson(file);
        
        // Check if this file contains appraiser data
        if (data && data.appraisers && Array.isArray(data.appraisers) && 
            data.appraisers.length > 0 && 
            data.appraisers[0].firstName && 
            data.appraisers[0].lastName) {
          
          console.log(`🔍 Possible appraiser data found at: ${file}`);
          console.log(`The file contains ${data.appraisers.length} appraisers.`);
          
          possibleMatchesCount++;
        }
      } catch (error) {
        // Skip files that can't be parsed as JSON
      }
    }
    
    if (possibleMatchesCount === 0) {
      console.log('❌ No files with appraiser data found in the repository.');
    } else {
      console.log(`Found ${possibleMatchesCount} possible appraiser data files.`);
    }
    
    return {
      found: false,
      possibleMatchesCount
    };
  } catch (error) {
    console.error('Error finding appraiser data:', error);
    return {
      found: false,
      error: error.message
    };
  }
}

// Run the function and print the result
findAppraiserData().then(result => {
  console.log('\nSummary:');
  console.log(result);
  
  if (!result.found) {
    console.log('\nTo use the image generation scripts, you need to:');
    console.log('1. Create a data directory: mkdir -p data');
    console.log('2. Create a sample appraisers.json file: npm run create-test');
    console.log('3. Then run the image generation scripts: npm run identify && npm run generate');
  } else {
    console.log('\nYou can now run the image generation scripts:');
    console.log('1. npm run identify - to find appraisers without images');
    console.log('2. npm run generate - to generate images for those appraisers');
    console.log('\nOr automatically build with images: npm run build-with-images');
  }
}); 