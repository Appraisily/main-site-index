// This script checks for missing images and regenerates them using the image-generation-service
// It validates image URLs using fetch HEAD requests to check if they actually exist
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_DIR = path.join(__dirname, '../src/data/locations');

// Image generation service URL
const IMAGE_GENERATION_SERVICE_URL = 'https://image-generation-service-856401495068.us-central1.run.app';
// ImageKit base URL for appraiser images
const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/appraisily/appraiser-images';

// Counters for reporting
let totalAppraisers = 0;
let missingImages = 0;
let generatedImages = 0;

/**
 * Check if an image URL is valid (returns a 200 status)
 * @param {string} imageUrl 
 * @returns {Promise<boolean>}
 */
async function isImageValid(imageUrl) {
  if (!imageUrl) return false;
  
  try {
    console.log(`Checking image URL: ${imageUrl}`);
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const valid = response.ok;
    if (!valid) {
      console.log(`Invalid image URL: ${imageUrl}`);
    }
    return valid;
  } catch (error) {
    console.error(`Error checking image URL ${imageUrl}:`, error.message);
    return false;
  }
}

/**
 * Generate a custom filename for an appraiser
 * @param {Object} appraiser 
 * @returns {string}
 */
function generateCustomFilename(appraiser) {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  return `appraiser_${appraiser.id}_${timestamp}_V${randomId}.jpg`;
}

/**
 * Generate an image for an appraiser using the image generation service
 * @param {Object} appraiser 
 * @param {string} city 
 * @param {string} state
 * @returns {Promise<Object>}
 */
async function generateImage(appraiser, city, state) {
  const customFilename = generateCustomFilename(appraiser);
  // Create a prompt that includes the city in the background
  const customPrompt = `Professional art appraiser in ${city}, ${state} with ${appraiser.specialties?.join(', ')} visible in the background`;
  
  console.log(`🖼️ Generating image for ${appraiser.name} (${appraiser.id})`);
  console.log(`📍 Location: ${city}, ${state}`);
  console.log(`🏷️ Filename: ${customFilename}`);
  console.log(`✏️ Prompt: ${customPrompt}`);
  
  try {
    const response = await fetch(`${IMAGE_GENERATION_SERVICE_URL}/api/generate-with-filename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appraiser,
        filename: customFilename,
        customPrompt
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully generated image: ${data.imageUrl}`);
    return data;
  } catch (error) {
    console.error(`❌ Error generating image for ${appraiser.id}:`, error);
    throw error;
  }
}

// Main function
async function checkAndGenerateMissingImages() {
  console.log('🔍 Starting to check for missing images across all locations');
  console.log(`🖥️ Using image generation service: ${IMAGE_GENERATION_SERVICE_URL}`);

  try {
    // Read all location JSON files
    const locationFiles = fs.readdirSync(LOCATIONS_DIR)
      .filter(file => file.endsWith('.json') && !file.includes('copy') && !file.includes('lifecycle') && !file.includes('cors') && !file.includes('hugo'));

    console.log(`📁 Found ${locationFiles.length} location files to process`);

    // Process each location file
    for (const file of locationFiles) {
      const locationFilePath = path.join(LOCATIONS_DIR, file);
      const locationData = JSON.parse(fs.readFileSync(locationFilePath, 'utf8'));
      const citySlug = file.replace('.json', '');
      let locationUpdated = false;

      const { city, state } = locationData;
      
      // Skip if no appraisers
      if (!locationData.appraisers || !Array.isArray(locationData.appraisers)) {
        console.log(`ℹ️ No appraisers found in ${file}`);
        continue;
      }

      console.log(`\n📍 Processing ${locationData.appraisers.length} appraisers in ${city}, ${state}`);
      
      // Process each appraiser
      for (const appraiser of locationData.appraisers) {
        totalAppraisers++;

        // Ensure appraiser has an id
        if (!appraiser.id) {
          // Generate id based on name and city if missing
          const namePart = appraiser.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          appraiser.id = `${citySlug}-${namePart}`;
          locationUpdated = true;
        }

        // Check if the image actually exists
        const imageExists = await isImageValid(appraiser.imageUrl);
        
        if (!imageExists) {
          missingImages++;
          console.log(`🔴 Missing image for ${appraiser.name} (${appraiser.id})`);
          
          try {
            // Call the image generation service
            const imageData = await generateImage(appraiser, city, state);
            
            // Store old image URL if it exists
            if (appraiser.imageUrl) {
              appraiser.oldImageUrl = appraiser.imageUrl;
            }
            if (appraiser.image) {
              appraiser.oldImage = appraiser.image;
              delete appraiser.image;
            }
            
            // Update with new URL
            appraiser.imageUrl = imageData.imageUrl;
            generatedImages++;
            locationUpdated = true;
            
            console.log(`🟢 Generated new image for ${appraiser.name}: ${imageData.imageUrl}`);
          } catch (error) {
            console.error(`Failed to generate image for ${appraiser.name}:`, error.message);
          }
        } else if (appraiser.image && !appraiser.imageUrl) {
          // If has image but no imageUrl, move to imageUrl
          appraiser.imageUrl = appraiser.image;
          appraiser.oldImage = appraiser.image;
          delete appraiser.image;
          locationUpdated = true;
        }
      }

      // Save the file if any changes were made
      if (locationUpdated) {
        fs.writeFileSync(locationFilePath, JSON.stringify(locationData, null, 2));
        console.log(`✅ Updated ${file}`);
      }
    }

    console.log(`
📊 Processing complete:
- Total appraisers processed: ${totalAppraisers}
- Total missing images found: ${missingImages}
- Total new images generated: ${generatedImages}
`);
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the function
checkAndGenerateMissingImages(); 