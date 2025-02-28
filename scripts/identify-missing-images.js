/**
 * Script to identify appraisers without images and output them to a JSON file
 * 
 * Usage: node scripts/identify-missing-images.js
 */

const fs = require('fs-extra');
const path = require('path');

async function identifyAppraisersWithoutImages() {
  try {
    console.log('Identifying appraisers without images...');
    
    // Path to appraiser data - adjust this to your actual data path
    const appraisersPath = path.join(__dirname, '../data/appraisers.json');
    
    // Check if the appraisers data file exists
    if (!await fs.pathExists(appraisersPath)) {
      console.error(`Error: Appraisers data file not found at ${appraisersPath}`);
      console.error('Please update the path in the script to point to your appraisers data file.');
      process.exit(1);
    }
    
    // Load the appraisers data
    const appraisersData = await fs.readJson(appraisersPath);
    
    if (!appraisersData.appraisers || !Array.isArray(appraisersData.appraisers)) {
      console.error('Error: Invalid appraisers data format. Expected { appraisers: [...] }');
      process.exit(1);
    }
    
    // Filter appraisers without images
    const appraisersWithoutImages = appraisersData.appraisers.filter(
      appraiser => !appraiser.imageUrl || appraiser.imageUrl.trim() === ''
    );
    
    console.log(`Found ${appraisersWithoutImages.length} appraisers without images out of ${appraisersData.appraisers.length} total appraisers.`);
    
    // If no appraisers need images, exit
    if (appraisersWithoutImages.length === 0) {
      console.log('✅ All appraisers already have images. Nothing to do.');
      process.exit(0);
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../temp');
    await fs.ensureDir(outputDir);
    
    // Prepare the output data
    const outputData = {
      count: appraisersWithoutImages.length,
      timestamp: new Date().toISOString(),
      appraisers: appraisersWithoutImages.map(appraiser => ({
        id: appraiser.id,
        firstName: appraiser.firstName || '',
        lastName: appraiser.lastName || '',
        company: appraiser.company || '',
        state: appraiser.state || '',
        licenseNumber: appraiser.licenseNumber || '',
        specialties: appraiser.specialties || [],
        specialty: appraiser.specialty || '', // Including both formats for compatibility
        experience: appraiser.experience || '',
        credentials: appraiser.credentials || '',
        education: appraiser.education || ''
      }))
    };
    
    // Write the output to a JSON file
    const outputPath = path.join(outputDir, 'appraisers-needing-images.json');
    await fs.writeJson(outputPath, outputData, { spaces: 2 });
    
    console.log(`✅ Successfully identified ${appraisersWithoutImages.length} appraisers without images.`);
    console.log(`Output written to: ${outputPath}`);
    console.log('Use the generate-appraiser-images.js script to generate images for these appraisers.');
    
  } catch (error) {
    console.error('Error identifying appraisers without images:', error);
    process.exit(1);
  }
}

// Run the function
identifyAppraisersWithoutImages(); 