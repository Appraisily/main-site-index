/**
 * Script to create sample appraiser data for testing
 * 
 * Usage: node scripts/create-test-data.js
 */

const fs = require('fs-extra');
const path = require('path');

async function createTestData() {
  try {
    console.log('Creating sample appraiser data for testing...');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../art-appraiser-directory-frontend/data');
    await fs.ensureDir(dataDir);
    
    // Sample appraiser data
    const appraisersData = {
      appraisers: [
        {
          id: 'test-001',
          firstName: 'John',
          lastName: 'Smith',
          company: 'Premier Appraisals LLC',
          state: 'California',
          licenseNumber: 'CA12345',
          specialties: ['Residential', 'Fine Art'],
          experience: '15+ years',
          credentials: 'Certified Appraiser',
          education: 'B.A. in Art History',
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'test-002',
          firstName: 'Jane',
          lastName: 'Doe',
          company: 'Expert Valuations',
          state: 'New York',
          licenseNumber: 'NY54321',
          specialties: ['Antiques', 'Jewelry'],
          experience: '20+ years',
          credentials: 'Master Appraiser',
          education: 'M.A. in Fine Arts',
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'test-003',
          firstName: 'Robert',
          lastName: 'Johnson',
          company: 'Heritage Appraisals',
          state: 'Texas',
          licenseNumber: 'TX78901',
          specialties: ['Commercial', 'Industrial'],
          experience: '10+ years',
          credentials: 'Licensed Appraiser',
          education: 'B.S. in Business',
          imageUrl: '' // Empty image URL to test generation
        },
        {
          id: 'test-004',
          firstName: 'Maria',
          lastName: 'Garcia',
          company: 'Prestige Valuations',
          state: 'Florida',
          licenseNumber: 'FL24680',
          specialties: ['Residential', 'Commercial'],
          experience: '12+ years',
          credentials: 'Certified Residential Appraiser',
          education: 'B.A. in Economics',
          imageUrl: 'https://example.com/existing-image.jpg' // Already has an image
        },
        {
          id: 'test-005',
          firstName: 'David',
          lastName: 'Chen',
          company: 'Pacific Appraisals',
          state: 'Washington',
          licenseNumber: 'WA13579',
          specialties: ['Luxury Properties', 'Waterfront'],
          experience: '8+ years',
          credentials: 'Licensed Real Estate Appraiser',
          education: 'MBA, Real Estate Concentration',
          imageUrl: '' // Empty image URL to test generation
        }
      ]
    };
    
    // Write the sample data to file
    const appraisersPath = path.join(dataDir, 'appraisers.json');
    await fs.writeJson(appraisersPath, appraisersData, { spaces: 2 });
    
    console.log(`✅ Successfully created sample appraiser data at: ${appraisersPath}`);
    console.log('You can now run the identify-missing-images.js and generate-appraiser-images.js scripts to test the workflow.');
    
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

// Run the function
createTestData(); 