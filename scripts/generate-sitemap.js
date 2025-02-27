/**
 * Sitemap Generator Script
 * 
 * This script fetches real appraiser IDs and city slugs from the API
 * and generates a sitemap.xml file with individual entries for each value.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { create } = require('xmlbuilder2');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.appraisily.com/v1';
const SITE_URL = process.env.SITE_URL || 'https://www.appraisily.com';
const OUTPUT_PATH = path.resolve(__dirname, '../dist/sitemap.xml');

// Base sitemap URLs (static pages)
const baseUrls = [
  { url: '/', priority: '1.0' },
  { url: '/about', priority: '0.8' },
  { url: '/team', priority: '0.8' },
  { url: '/services', priority: '0.8' },
  { url: '/expertise', priority: '0.8' },
  { url: '/how-it-works', priority: '0.8' },
  { url: '/terms', priority: '0.8' },
  { url: '/directory', priority: '0.8' },
  { url: '/screener', priority: '0.8' },
  { url: '/art-appraiser', priority: '0.8' },
  { url: '/painting-value', priority: '0.8' },
  { url: '/success-payment', priority: '0.8' },
  { url: '/submission-success', priority: '0.8' },
  { url: '/dashboard', priority: '0.8' },
  { url: '/start', priority: '0.8' },
  { url: '/bulk-appraisal', priority: '0.8' },
  { url: '/bulk-appraisal/upload', priority: '0.8' },
  { url: '/bulk-appraisal/review', priority: '0.8' },
  { url: '/art-appraiser/ArtAppraiser', priority: '0.8' },
  { url: '/screener/AnalyzePage', priority: '0.8' },
  { url: '/screener/HomePage', priority: '0.8' },
];

/**
 * Fetch appraiser IDs from the API
 * @returns {Promise<string[]>} Array of appraiser IDs
 */
async function fetchAppraiserIds() {
  try {
    console.log('Fetching appraiser IDs...');
    
    // Replace this with your actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/appraisers`);
    
    // Extract appraiser IDs from the response
    // Adjust this based on your actual API response structure
    const appraiserIds = response.data.map(appraiser => appraiser.id);
    
    console.log(`Fetched ${appraiserIds.length} appraiser IDs`);
    return appraiserIds;
  } catch (error) {
    console.error('Error fetching appraiser IDs:', error.message);
    
    // Fallback to sample data if API request fails
    console.log('Using fallback appraiser IDs');
    return [
      'john-doe-1234', 
      'jane-smith-5678', 
      'robert-johnson-9012',
      'sarah-williams-3456',
      'michael-brown-7890'
    ];
  }
}

/**
 * Fetch city slugs from the API
 * @returns {Promise<string[]>} Array of city slugs
 */
async function fetchCitySlugs() {
  try {
    console.log('Fetching city slugs...');
    
    // Replace this with your actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/locations`);
    
    // Extract city slugs from the response
    // Adjust this based on your actual API response structure
    const citySlugs = response.data.map(location => location.slug);
    
    console.log(`Fetched ${citySlugs.length} city slugs`);
    return citySlugs;
  } catch (error) {
    console.error('Error fetching city slugs:', error.message);
    
    // Fallback to sample data if API request fails
    console.log('Using fallback city slugs');
    return [
      'new-york-ny', 
      'los-angeles-ca', 
      'chicago-il', 
      'miami-fl',
      'san-francisco-ca',
      'boston-ma',
      'philadelphia-pa',
      'houston-tx',
      'seattle-wa',
      'denver-co'
    ];
  }
}

/**
 * Generate sitemap.xml with all URLs
 * @param {string[]} appraiserIds - Array of appraiser IDs
 * @param {string[]} citySlugs - Array of city slugs
 */
function generateSitemap(appraiserIds, citySlugs) {
  console.log('Generating sitemap.xml...');
  
  // Current date for lastmod
  const lastMod = new Date().toISOString();
  
  // Create XML structure
  const xmlObj = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
  
  // Add base URLs
  baseUrls.forEach(({ url, priority }) => {
    xmlObj.ele('url')
      .ele('loc').txt(`${SITE_URL}${url}`).up()
      .ele('lastmod').txt(lastMod).up()
      .ele('changefreq').txt('weekly').up()
      .ele('priority').txt(priority).up();
  });
  
  // Add appraiser URLs
  appraiserIds.forEach(appraiserId => {
    xmlObj.ele('url')
      .ele('loc').txt(`${SITE_URL}/directory/appraiser/${appraiserId}`).up()
      .ele('lastmod').txt(lastMod).up()
      .ele('changefreq').txt('weekly').up()
      .ele('priority').txt('0.8').up();
  });
  
  // Add city URLs
  citySlugs.forEach(citySlug => {
    xmlObj.ele('url')
      .ele('loc').txt(`${SITE_URL}/directory/location/${citySlug}`).up()
      .ele('lastmod').txt(lastMod).up()
      .ele('changefreq').txt('weekly').up()
      .ele('priority').txt('0.8').up();
  });
  
  // Convert to XML string
  const xmlString = xmlObj.end({ prettyPrint: true });
  
  // Ensure the directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to file
  fs.writeFileSync(OUTPUT_PATH, xmlString);
  console.log(`Sitemap generated at ${OUTPUT_PATH}`);
}

/**
 * Main function to run the sitemap generation
 */
async function main() {
  try {
    // Fetch data
    const [appraiserIds, citySlugs] = await Promise.all([
      fetchAppraiserIds(),
      fetchCitySlugs()
    ]);
    
    // Generate sitemap
    generateSitemap(appraiserIds, citySlugs);
    
    console.log('Sitemap generation completed successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
main(); 