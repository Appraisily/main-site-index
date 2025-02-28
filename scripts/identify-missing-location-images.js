/**
 * Script to identify locations without images and output them to a JSON file
 * 
 * Usage: node scripts/identify-missing-location-images.js
 */

const fs = require('fs-extra');
const path = require('path');

async function identifyLocationsWithoutImages() {
  try {
    console.log('Identifying locations without images...');
    
    // Path to location data - adjust this to your actual data path
    const locationsPath = path.join(__dirname, '../art-appraiser-directory-frontend/data/locations.json');
    
    // Check if the locations data file exists
    if (!await fs.pathExists(locationsPath)) {
      console.error(`Error: Locations data file not found at ${locationsPath}`);
      console.error('Please update the path in the script to point to your locations data file.');
      process.exit(1);
    }
    
    // Load the locations data
    const locationsData = await fs.readJson(locationsPath);
    
    if (!locationsData.locations || !Array.isArray(locationsData.locations)) {
      console.error('Error: Invalid locations data format. Expected { locations: [...] }');
      process.exit(1);
    }
    
    // Filter locations without images
    const locationsWithoutImages = locationsData.locations.filter(
      location => !location.imageUrl || location.imageUrl.trim() === ''
    );
    
    console.log(`Found ${locationsWithoutImages.length} locations without images out of ${locationsData.locations.length} total locations.`);
    
    // If no locations need images, exit
    if (locationsWithoutImages.length === 0) {
      console.log('✅ All locations already have images. Nothing to do.');
      process.exit(0);
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../temp');
    await fs.ensureDir(outputDir);
    
    // Prepare the output data
    const outputData = {
      count: locationsWithoutImages.length,
      timestamp: new Date().toISOString(),
      locations: locationsWithoutImages.map(location => ({
        id: location.id,
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        type: location.type || '',
        description: location.description || '',
        features: location.features || []
      }))
    };
    
    // Write the output to a JSON file
    const outputPath = path.join(outputDir, 'locations-needing-images.json');
    await fs.writeJson(outputPath, outputData, { spaces: 2 });
    
    console.log(`✅ Successfully identified ${locationsWithoutImages.length} locations without images.`);
    console.log(`Output written to: ${outputPath}`);
    console.log('Use the generate-location-images.js script to generate images for these locations.');
    
  } catch (error) {
    console.error('Error identifying locations without images:', error);
    process.exit(1);
  }
}

// Run the function
identifyLocationsWithoutImages(); 