/**
 * Script to generate images for locations and update data with image URLs
 * 
 * Usage: node scripts/generate-location-images.js
 * 
 * This script:
 * 1. Reads the list of locations needing images
 * 2. Makes API calls to the image generation service
 * 3. Updates the location data with the image URLs
 * 4. Logs progress and results
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Configuration
const CONFIG = {
  // Image generation service URL
  imageServiceUrl: 'https://image-generation-service-856401495068.us-central1.run.app/api/generate-location',
  // Input file with locations needing images
  inputFile: path.join(__dirname, '../temp/locations-needing-images.json'),
  // Path to location data - adjust this to your actual data path
  locationsDataFile: path.join(__dirname, '../art-appraiser-directory-frontend/data/locations.json'),
  // Delay between API calls (in ms) to avoid overwhelming the service
  apiCallDelay: 3000,
  // Maximum concurrency for API calls
  maxConcurrency: 3
};

// Utility to wait for a specified delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a single image for a location
async function generateImageForLocation(location) {
  try {
    console.log(`Generating image for location: ${location.name} (${location.id})`);
    
    // Prepare the API request payload
    const payload = {
      location: {
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        type: location.type || 'Office',
        description: location.description || '',
        features: Array.isArray(location.features) ? location.features : []
      }
    };
    
    // Make the API call to generate the image
    const response = await axios.post(CONFIG.imageServiceUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60-second timeout
    });
    
    // Check for successful response
    if (response.status === 200 && response.data && response.data.success && response.data.data && response.data.data.imageUrl) {
      console.log(`✅ Successfully generated image for ${location.name} (${location.id})`);
      return {
        location,
        success: true,
        imageUrl: response.data.data.imageUrl,
        originalUrl: response.data.data.originalUrl || null,
        error: null
      };
    } else {
      console.error(`❌ Failed to generate image for ${location.id} - Invalid response:`, JSON.stringify(response.data, null, 2));
      return {
        location,
        success: false,
        imageUrl: null,
        originalUrl: null,
        error: 'Invalid response from image generation service'
      };
    }
  } catch (error) {
    console.error(`❌ Error generating image for ${location.id}:`, error.message);
    return {
      location,
      success: false,
      imageUrl: null,
      originalUrl: null,
      error: error.message
    };
  }
}

// Process locations in batches to control concurrency
async function processBatch(locations, batchIndex, batchSize, results) {
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, locations.length);
  const batch = locations.slice(start, end);
  
  console.log(`Processing batch ${batchIndex + 1} of ${Math.ceil(locations.length / batchSize)} (${batch.length} locations)`);
  
  // Process the batch with controlled concurrency
  const batchResults = [];
  const inProgress = new Set();
  
  for (let i = 0; i < batch.length; i++) {
    // Wait if we've reached max concurrency
    while (inProgress.size >= CONFIG.maxConcurrency) {
      await sleep(100);
    }
    
    // Process this location
    const location = batch[i];
    inProgress.add(location.id);
    
    generateImageForLocation(location).then(result => {
      batchResults.push(result);
      results.push(result);
      inProgress.delete(location.id);
    });
    
    // Add slight delay between starting API calls
    if (i < batch.length - 1) {
      await sleep(300);
    }
  }
  
  // Wait for all operations in this batch to complete
  while (inProgress.size > 0) {
    await sleep(500);
  }
  
  console.log(`Completed batch ${batchIndex + 1} - ${batchResults.filter(r => r.success).length} succeeded, ${batchResults.filter(r => !r.success).length} failed`);
  
  // Wait between batches
  if (end < locations.length) {
    console.log(`Waiting ${CONFIG.apiCallDelay}ms before starting next batch...`);
    await sleep(CONFIG.apiCallDelay);
  }
}

// Update the location data with image URLs
async function updateLocationData(results) {
  try {
    console.log('Updating location data with generated image URLs...');
    
    // Load the locations data
    const locationsData = await fs.readJson(CONFIG.locationsDataFile);
    
    if (!locationsData.locations || !Array.isArray(locationsData.locations)) {
      throw new Error('Invalid locations data format');
    }
    
    // Create lookup map for quick access to results
    const resultMap = {};
    results.forEach(result => {
      if (result.success && result.imageUrl) {
        resultMap[result.location.id] = result.imageUrl;
        console.log(`Adding image URL for ${result.location.id}: ${result.imageUrl}`);
      } else if (result.imageUrl) {
        // Handle case where success might be false but we still have an imageUrl
        resultMap[result.location.id] = result.imageUrl;
        console.log(`Adding image URL for ${result.location.id} despite failed status: ${result.imageUrl}`);
      }
    });
    
    // Update imageUrl for each location
    let updateCount = 0;
    locationsData.locations = locationsData.locations.map(location => {
      if (resultMap[location.id]) {
        updateCount++;
        return {
          ...location,
          imageUrl: resultMap[location.id]
        };
      }
      return location;
    });
    
    // Create backup of original data
    const backupPath = `${CONFIG.locationsDataFile}.backup-${Date.now()}.json`;
    await fs.copy(CONFIG.locationsDataFile, backupPath);
    console.log(`Created backup of original data at ${backupPath}`);
    
    // Write updated data
    await fs.writeJson(CONFIG.locationsDataFile, locationsData, { spaces: 2 });
    
    console.log(`✅ Successfully updated ${updateCount} locations with image URLs`);
    return updateCount;
  } catch (error) {
    console.error('Error updating location data:', error);
    throw error;
  }
}

// Main function
async function generateLocationImages() {
  try {
    console.log('Starting location image generation...');
    console.log(`Using image service: ${CONFIG.imageServiceUrl}`);
    
    // Check if the input file exists
    if (!await fs.pathExists(CONFIG.inputFile)) {
      console.error(`Input file not found: ${CONFIG.inputFile}`);
      console.error('Please run scripts/identify-missing-location-images.js first to generate the input file.');
      process.exit(1);
    }
    
    // Load the list of locations needing images
    const inputData = await fs.readJson(CONFIG.inputFile);
    
    if (!inputData.locations || !Array.isArray(inputData.locations) || inputData.locations.length === 0) {
      console.error('No locations found in the input file or invalid format.');
      process.exit(1);
    }
    
    console.log(`Found ${inputData.locations.length} locations needing images.`);
    
    // Process locations in batches
    const results = [];
    const batchSize = 5; // Number of locations per batch
    const totalBatches = Math.ceil(inputData.locations.length / batchSize);
    
    console.log(`Processing ${inputData.locations.length} locations in ${totalBatches} batches...`);
    
    // Process all batches
    for (let i = 0; i < totalBatches; i++) {
      await processBatch(inputData.locations, i, batchSize, results);
    }
    
    // Generate summary
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);
    
    console.log('\n=== Image Generation Summary ===');
    console.log(`Total locations processed: ${results.length}`);
    console.log(`Successfully generated images: ${successful.length}`);
    console.log(`Failed to generate images: ${failed.length}`);
    
    // Save results to a log file
    const logData = {
      timestamp: new Date().toISOString(),
      totalProcessed: results.length,
      successful: successful.length,
      failed: failed.length,
      results: results
    };
    
    const logDir = path.join(__dirname, '../logs');
    await fs.ensureDir(logDir);
    const logPath = path.join(logDir, `location-image-generation-${Date.now()}.json`);
    await fs.writeJson(logPath, logData, { spaces: 2 });
    console.log(`Detailed results written to: ${logPath}`);
    
    // Update location data with image URLs
    if (successful.length > 0) {
      const updatedCount = await updateLocationData(results);
      console.log(`Updated ${updatedCount} locations with image URLs.`);
    }
    
    console.log('Location image generation process completed.');
    
  } catch (error) {
    console.error('Error in location image generation process:', error);
    process.exit(1);
  }
}

// Run the function
generateLocationImages(); 