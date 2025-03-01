const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const IMAGE_GEN_API_URL = 'https://image-generation-service-856401495068.us-central1.run.app';
const LOCAL_DATA_DIR = path.join(__dirname, '../data/cities');

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
 * @returns {Promise<Object>}
 */
async function generateImage(appraiser, city, state) {
  const customFilename = generateCustomFilename(appraiser);
  // Create a prompt that includes the city in the background
  const customPrompt = `Professional art appraiser in ${city}, ${state} with ${appraiser.specialties.join(', ')} visible in the background`;
  
  console.log(`🖼️ Generating image for ${appraiser.name} (${appraiser.id})`);
  console.log(`📍 Location: ${city}, ${state}`);
  console.log(`🏷️ Filename: ${customFilename}`);
  console.log(`✏️ Prompt: ${customPrompt}`);
  
  try {
    const response = await fetch(`${IMAGE_GEN_API_URL}/api/generate-with-filename`, {
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

/**
 * List all city files in the local data directory
 * @returns {Promise<string[]>}
 */
async function listLocalCityFiles() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      console.log(`Creating local data directory: ${LOCAL_DATA_DIR}`);
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
      return [];
    }
    
    const files = await fs.readdir(LOCAL_DATA_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  } catch (error) {
    console.error('Error listing local city files:', error);
    return [];
  }
}

/**
 * Process a city's data to check for missing images and generate them
 * @param {string} citySlug 
 */
async function processCityData(citySlug) {
  console.log(`\n📍 Processing city: ${citySlug}`);
  
  try {
    // Get the city data from local file
    const filePath = path.join(LOCAL_DATA_DIR, `${citySlug}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`No data found for city: ${citySlug}`);
      return { processed: 0, generated: 0 };
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const cityData = JSON.parse(content);
    
    if (!cityData || !cityData.data || !cityData.data.data || !cityData.data.data.appraisers) {
      console.log(`Invalid data format for city: ${citySlug}`);
      return { processed: 0, generated: 0 };
    }
    
    const { city, state } = cityData;
    const appraisers = cityData.data.data.appraisers;
    
    console.log(`Found ${appraisers.length} appraisers in ${city}, ${state}`);
    
    // Check each appraiser for missing images
    let missingCount = 0;
    let generatedCount = 0;
    
    for (const appraiser of appraisers) {
      const hasValidImage = await isImageValid(appraiser.imageUrl);
      
      if (!hasValidImage) {
        missingCount++;
        
        try {
          const imageData = await generateImage(appraiser, city, state);
          appraiser.imageUrl = imageData.imageUrl;
          generatedCount++;
        } catch (error) {
          console.error(`Failed to generate image for ${appraiser.name}:`, error.message);
        }
      }
    }
    
    console.log(`Found ${missingCount} appraisers with missing images in ${city}, ${state}`);
    console.log(`Generated ${generatedCount} new images`);
    
    // Update the city data with the new image URLs
    if (generatedCount > 0) {
      console.log(`Updating city data for ${city}, ${state}`);
      
      // Update the local file
      await fs.writeFile(filePath, JSON.stringify(cityData, null, 2), 'utf8');
      
      console.log(`✅ Successfully updated city data for ${city}, ${state}`);
    }
    
    return { processed: missingCount, generated: generatedCount };
  } catch (error) {
    console.error(`Error processing city ${citySlug}:`, error);
    return { processed: 0, generated: 0 };
  }
}

/**
 * Generate images for sample data if no cities are found
 */
async function generateSampleImages() {
  console.log('\n📍 No city data found. Generating sample images for testing.');
  
  const sampleAppraisers = [
    {
      id: 'newyork-john-smith',
      name: 'John Smith',
      specialties: ['Fine Art', 'Antiques'],
      imageUrl: null
    },
    {
      id: 'chicago-jane-doe',
      name: 'Jane Doe',
      specialties: ['Modern Art', 'Sculptures'],
      imageUrl: null
    },
    {
      id: 'miami-robert-johnson',
      name: 'Robert Johnson',
      specialties: ['Contemporary Art', 'Prints'],
      imageUrl: null
    }
  ];
  
  const cities = [
    { slug: 'newyork', city: 'New York', state: 'NY' },
    { slug: 'chicago', city: 'Chicago', state: 'IL' },
    { slug: 'miami', city: 'Miami', state: 'FL' }
  ];
  
  let generatedCount = 0;
  
  for (let i = 0; i < sampleAppraisers.length; i++) {
    const appraiser = sampleAppraisers[i];
    const city = cities[i];
    
    console.log(`\n🖼️ Generating sample image for ${appraiser.name} (${appraiser.id})`);
    console.log(`📍 Location: ${city.city}, ${city.state}`);
    
    try {
      const imageData = await generateImage(appraiser, city.city, city.state);
      appraiser.imageUrl = imageData.imageUrl;
      generatedCount++;
      
      console.log(`✅ Generated image: ${imageData.imageUrl}`);
    } catch (error) {
      console.error(`❌ Error generating sample image:`, error.message);
    }
  }
  
  console.log(`\n📊 Generated ${generatedCount} sample images`);
  return generatedCount;
}

/**
 * Main function to check all cities for missing images
 */
async function generateMissingImages() {
  console.log('🔍 Starting to check for missing images across all cities');
  console.log(`🖥️ Using image generation service: ${IMAGE_GEN_API_URL}`);
  
  try {
    const cityFiles = await listLocalCityFiles();
    console.log(`📊 Found ${cityFiles.length} city files`);
    
    let totalProcessed = 0;
    let totalGenerated = 0;
    
    if (cityFiles.length === 0) {
      // If no city files are found, generate sample images
      totalGenerated = await generateSampleImages();
    } else {
      // Process each city file
      for (const citySlug of cityFiles) {
        const { processed, generated } = await processCityData(citySlug);
        totalProcessed += processed;
        totalGenerated += generated;
      }
    }
    
    console.log('\n📝 Summary:');
    console.log(`📊 Total appraisers with missing images: ${totalProcessed}`);
    console.log(`🖼️ Total images generated: ${totalGenerated}`);
    
    console.log('\n✅ Completed checking all cities for missing images');
    return { totalProcessed, totalGenerated };
  } catch (error) {
    console.error('❌ Error checking cities:', error);
    return { totalProcessed: 0, totalGenerated: 0 };
  }
}

// Execute the script
if (require.main === module) {
  console.log('🚀 Local Image Generation Script');
  console.log('This script checks for missing appraiser images and generates them before the build process');
  console.log('Using local file system instead of Google Cloud Storage');
  
  generateMissingImages()
    .then(({ totalProcessed, totalGenerated }) => {
      if (totalGenerated > 0) {
        console.log(`✅ Successfully generated ${totalGenerated} missing images`);
      } else if (totalProcessed > 0) {
        console.log(`⚠️ Found ${totalProcessed} missing images but could not generate them`);
      } else {
        console.log('✅ No missing images found');
      }
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { generateMissingImages }; 