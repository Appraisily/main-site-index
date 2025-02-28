/**
 * Script to generate images for appraisers and update data with image URLs
 * 
 * Usage: node scripts/generate-appraiser-images.js
 * 
 * This script:
 * 1. Reads the list of appraisers needing images
 * 2. Makes API calls to the image generation service
 * 3. Updates the appraiser data with the image URLs
 * 4. Logs progress and results
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Configuration
const CONFIG = {
  // Image generation service URL
  imageServiceUrl: 'https://image-generation-service-856401495068.us-central1.run.app/api/generate',
  // Input file with appraisers needing images
  inputFile: path.join(__dirname, '../temp/appraisers-needing-images.json'),
  // Path to appraiser data - adjust this to your actual data path
  appraisersDataFile: path.join(__dirname, '../data/appraisers.json'),
  // Delay between API calls (in ms) to avoid overwhelming the service
  apiCallDelay: 3000,
  // Maximum concurrency for API calls
  maxConcurrency: 3
};

// Utility to wait for a specified delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a single image for an appraiser
async function generateImageForAppraiser(appraiser) {
  try {
    console.log(`Generating image for appraiser: ${appraiser.firstName} ${appraiser.lastName} (${appraiser.id})`);
    
    // Prepare the API request payload
    const payload = {
      appraiser: {
        id: appraiser.id,
        firstName: appraiser.firstName,
        lastName: appraiser.lastName,
        company: appraiser.company,
        state: appraiser.state,
        licenseNumber: appraiser.licenseNumber,
        specialties: Array.isArray(appraiser.specialties) 
          ? appraiser.specialties 
          : (appraiser.specialty ? [appraiser.specialty] : [])
      }
    };
    
    // Make the API call to generate the image
    const response = await axios.post(CONFIG.imageServiceUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60-second timeout
    });
    
    // Check for successful response
    if (response.status === 200 && response.data && response.data.imageUrl) {
      console.log(`✅ Successfully generated image for ${appraiser.firstName} ${appraiser.lastName} (${appraiser.id})`);
      return {
        appraiser,
        success: true,
        imageUrl: response.data.imageUrl,
        originalUrl: response.data.originalUrl || null,
        error: null
      };
    } else {
      console.error(`❌ Failed to generate image for ${appraiser.id} - Invalid response:`, response.data);
      return {
        appraiser,
        success: false,
        imageUrl: null,
        originalUrl: null,
        error: 'Invalid response from image generation service'
      };
    }
  } catch (error) {
    console.error(`❌ Error generating image for ${appraiser.id}:`, error.message);
    return {
      appraiser,
      success: false,
      imageUrl: null,
      originalUrl: null,
      error: error.message
    };
  }
}

// Process appraisers in batches to control concurrency
async function processBatch(appraisers, batchIndex, batchSize, results) {
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, appraisers.length);
  const batch = appraisers.slice(start, end);
  
  console.log(`Processing batch ${batchIndex + 1} of ${Math.ceil(appraisers.length / batchSize)} (${batch.length} appraisers)`);
  
  // Process the batch with controlled concurrency
  const batchResults = [];
  const inProgress = new Set();
  
  for (let i = 0; i < batch.length; i++) {
    // Wait if we've reached max concurrency
    while (inProgress.size >= CONFIG.maxConcurrency) {
      await sleep(100);
    }
    
    // Process this appraiser
    const appraiser = batch[i];
    inProgress.add(appraiser.id);
    
    generateImageForAppraiser(appraiser).then(result => {
      batchResults.push(result);
      results.push(result);
      inProgress.delete(appraiser.id);
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
  if (end < appraisers.length) {
    console.log(`Waiting ${CONFIG.apiCallDelay}ms before starting next batch...`);
    await sleep(CONFIG.apiCallDelay);
  }
}

// Update the appraiser data with image URLs
async function updateAppraiserData(results) {
  try {
    console.log('Updating appraiser data with generated image URLs...');
    
    // Load the appraisers data
    const appraisersData = await fs.readJson(CONFIG.appraisersDataFile);
    
    if (!appraisersData.appraisers || !Array.isArray(appraisersData.appraisers)) {
      throw new Error('Invalid appraisers data format');
    }
    
    // Create lookup map for quick access to results
    const resultMap = {};
    results.forEach(result => {
      if (result.success && result.imageUrl) {
        resultMap[result.appraiser.id] = result.imageUrl;
      }
    });
    
    // Update imageUrl for each appraiser
    let updateCount = 0;
    appraisersData.appraisers = appraisersData.appraisers.map(appraiser => {
      if (resultMap[appraiser.id]) {
        updateCount++;
        return {
          ...appraiser,
          imageUrl: resultMap[appraiser.id]
        };
      }
      return appraiser;
    });
    
    // Create backup of original data
    const backupPath = `${CONFIG.appraisersDataFile}.backup-${Date.now()}.json`;
    await fs.copy(CONFIG.appraisersDataFile, backupPath);
    console.log(`Created backup of original data at ${backupPath}`);
    
    // Write updated data
    await fs.writeJson(CONFIG.appraisersDataFile, appraisersData, { spaces: 2 });
    
    console.log(`✅ Successfully updated ${updateCount} appraisers with image URLs`);
    return updateCount;
  } catch (error) {
    console.error('Error updating appraiser data:', error);
    throw error;
  }
}

// Main function
async function generateAppraiserImages() {
  try {
    console.log('Starting appraiser image generation...');
    console.log(`Using image service: ${CONFIG.imageServiceUrl}`);
    
    // Check if the input file exists
    if (!await fs.pathExists(CONFIG.inputFile)) {
      console.error(`Input file not found: ${CONFIG.inputFile}`);
      console.error('Please run scripts/identify-missing-images.js first to generate the input file.');
      process.exit(1);
    }
    
    // Load the list of appraisers needing images
    const inputData = await fs.readJson(CONFIG.inputFile);
    
    if (!inputData.appraisers || !Array.isArray(inputData.appraisers) || inputData.appraisers.length === 0) {
      console.error('No appraisers found in the input file or invalid format.');
      process.exit(1);
    }
    
    console.log(`Found ${inputData.appraisers.length} appraisers needing images.`);
    
    // Process appraisers in batches
    const results = [];
    const batchSize = 5; // Number of appraisers per batch
    const totalBatches = Math.ceil(inputData.appraisers.length / batchSize);
    
    console.log(`Processing ${inputData.appraisers.length} appraisers in ${totalBatches} batches...`);
    
    // Process all batches
    for (let i = 0; i < totalBatches; i++) {
      await processBatch(inputData.appraisers, i, batchSize, results);
    }
    
    // Generate summary
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);
    
    console.log('\n=== Image Generation Summary ===');
    console.log(`Total appraisers processed: ${results.length}`);
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
    const logPath = path.join(logDir, `image-generation-${Date.now()}.json`);
    await fs.writeJson(logPath, logData, { spaces: 2 });
    console.log(`Detailed results written to: ${logPath}`);
    
    // Update appraiser data with image URLs
    if (successful.length > 0) {
      const updatedCount = await updateAppraiserData(results);
      console.log(`Updated ${updatedCount} appraisers with image URLs.`);
    }
    
    console.log('Image generation process completed.');
    
  } catch (error) {
    console.error('Error in image generation process:', error);
    process.exit(1);
  }
}

// Run the function
generateAppraiserImages(); 