import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_DIR = path.join(__dirname, '../src/data/locations');

// Default placeholder image for missing images
const DEFAULT_PLACEHOLDER_IMAGE = 'https://ik.imagekit.io/appraisily/placeholder-art-image.jpg';

// Image generation service URL - replace with your actual URL
const IMAGE_GENERATION_API = process.env.IMAGE_GENERATION_API || 'http://localhost:3000/api/generate';

// Counters for reporting
let totalAppraisers = 0;
let missingImages = 0;
let generatedImages = 0;
let failedImages = 0;

// Function to generate a prompt based on appraiser specialties
function generatePrompt(appraiser) {
  // Extract specialties or use default
  const specialties = Array.isArray(appraiser.specialties) && appraiser.specialties.length > 0
    ? appraiser.specialties.join(', ')
    : appraiser.specialties || 'fine art';
  
  // Create a prompt for the image generator
  return `Professional art appraiser specializing in ${specialties} in an elegant office with artwork, good lighting, professional attire`;
}

// Function to request image generation
async function generateImage(appraiser, filename) {
  try {
    console.log(`\nGenerating image for ${appraiser.name} (${appraiser.id})...`);
    const prompt = generatePrompt(appraiser);
    console.log(`Prompt: ${prompt}`);
    console.log(`Filename: ${filename}`);
    
    // Call the image generation API
    const response = await fetch(IMAGE_GENERATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appraiser,
        customPrompt: prompt,
        filename
      }),
      timeout: 60000 // 60 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from image generation service');
    }
    
    console.log(`✅ Successfully generated image: ${data.imageUrl}`);
    return data;
  } catch (error) {
    console.error(`❌ Error generating image: ${error.message}`);
    failedImages++;
    return null;
  }
}

// Main function to process all locations
async function main() {
  console.log('Starting image generation for appraisers with missing images...');
  
  // Read all location JSON files
  const locationFiles = fs.readdirSync(LOCATIONS_DIR)
    .filter(file => file.endsWith('.json') && !file.includes('copy') && !file.includes('lifecycle') && !file.includes('cors') && !file.includes('hugo'));

  console.log(`Found ${locationFiles.length} location files to process`);

  // Process each location file
  for (const file of locationFiles) {
    const locationFilePath = path.join(LOCATIONS_DIR, file);
    const locationData = JSON.parse(fs.readFileSync(locationFilePath, 'utf8'));
    const citySlug = file.replace('.json', '');
    let locationUpdated = false;

    // Skip if no appraisers
    if (!locationData.appraisers || !Array.isArray(locationData.appraisers)) {
      console.log(`No appraisers found in ${file}`);
      continue;
    }

    console.log(`\nProcessing ${locationData.appraisers.length} appraisers in ${file}...`);

    // Process each appraiser
    for (let i = 0; i < locationData.appraisers.length; i++) {
      const appraiser = locationData.appraisers[i];
      totalAppraisers++;

      // Ensure appraiser has an id
      if (!appraiser.id) {
        // Generate id based on name and city if missing
        const namePart = appraiser.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        appraiser.id = `${citySlug}-${namePart}`;
        locationUpdated = true;
      }

      // Check if imageUrl matches the expected pattern
      const hasProperImageUrl = appraiser.imageUrl &&
        (appraiser.imageUrl.includes('_') &&
        (appraiser.imageUrl.includes('?updatedAt=') || appraiser.imageUrl.includes('_V')));

      if (!hasProperImageUrl) {
        missingImages++;
        
        // Generate a timestamp for uniqueness
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 10);

        // Create a filename matching the image generator pattern
        const newImageFilename = `appraiser_${appraiser.id}_${timestamp}_V${randomId}.jpg`;
        
        // If there's already an imageUrl or image property, store it as backup
        if (appraiser.imageUrl) {
          appraiser.oldImageUrl = appraiser.imageUrl;
        }
        if (appraiser.image) {
          appraiser.oldImage = appraiser.image;
          // Delete the old image property - standardize on imageUrl
          delete appraiser.image;
        }
        
        // Generate the image
        const result = await generateImage(appraiser, newImageFilename);
        
        if (result && result.success && result.imageUrl) {
          // Update with new generated URL
          appraiser.imageUrl = result.imageUrl;
          generatedImages++;
          locationUpdated = true;
        } else {
          // If generation failed, use a placeholder
          console.log(`Using placeholder image for ${appraiser.name} due to generation failure`);
          appraiser.imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
          locationUpdated = true;
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
      console.log(`Updated ${file}`);
    }
  }

  console.log(`
Processing complete:
- Total appraisers processed: ${totalAppraisers}
- Missing images identified: ${missingImages}
- Images successfully generated: ${generatedImages}
- Failed generations: ${failedImages}
`);

  console.log(`
Next steps:
1. Run 'npm run rebuild-static' to rebuild the static files with the updated image URLs
2. Commit and push the changes
3. Rebuild and deploy the site
`);
}

// Run the main function
main().catch(console.error); 