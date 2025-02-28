/**
 * Script to create sample location data for testing
 * 
 * Usage: node scripts/create-test-location-data.js
 */

const fs = require('fs-extra');
const path = require('path');

async function createTestLocationData() {
  try {
    console.log('Creating sample location data for testing...');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../art-appraiser-directory-frontend/data');
    await fs.ensureDir(dataDir);
    
    // Sample location data
    const locationsData = {
      locations: [
        {
          id: 'loc-001',
          name: 'Premier Art Gallery',
          address: '123 Art Avenue',
          city: 'Los Angeles',
          state: 'California',
          type: 'Gallery',
          description: 'A prestigious gallery specializing in contemporary art',
          features: ['High ceilings', 'Natural lighting', 'Modern architecture'],
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'loc-002',
          name: 'Historic Museum of Fine Arts',
          address: '456 Museum Row',
          city: 'New York',
          state: 'New York',
          type: 'Museum',
          description: 'A historic museum housing classical and renaissance art collections',
          features: ['Classical architecture', 'Grand entrance', 'Multiple exhibition halls'],
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'loc-003',
          name: 'Downtown Appraisal Office',
          address: '789 Business Blvd',
          city: 'Chicago',
          state: 'Illinois',
          type: 'Office',
          description: 'A professional office space in the heart of downtown',
          features: ['Modern design', 'Reception area', 'Private consulting rooms'],
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'loc-004',
          name: 'Seaside Art Center',
          address: '321 Coastal Drive',
          city: 'Miami',
          state: 'Florida',
          type: 'Art Center',
          description: 'A contemporary art center with ocean views',
          features: ['Waterfront location', 'Outdoor exhibition space', 'Glass façade'],
          imageUrl: 'https://example.com/existing-image.jpg' // Already has an image
        },
        {
          id: 'loc-005',
          name: 'Mountain View Auction House',
          address: '567 Highland Road',
          city: 'Denver',
          state: 'Colorado',
          type: 'Auction House',
          description: 'An elegant auction house specializing in fine art and antiques',
          features: ['Grand auction hall', 'Preview galleries', 'Mountain views'],
          imageUrl: '' // Empty image URL to test generation
        }
      ]
    };
    
    // Write the sample data to file
    const locationsPath = path.join(dataDir, 'locations.json');
    await fs.writeJson(locationsPath, locationsData, { spaces: 2 });
    
    console.log(`✅ Successfully created sample location data at: ${locationsPath}`);
    console.log('You can now run the identify-missing-location-images.js and generate-location-images.js scripts to test the workflow.');
    
  } catch (error) {
    console.error('Error creating test location data:', error);
    process.exit(1);
  }
}

// Run the function
createTestLocationData(); 