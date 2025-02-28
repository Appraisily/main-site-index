/**
 * Sitemap Index Generator Script
 * 
 * This script generates a sitemap_index.xml file that references all the sitemaps
 * from the various submodules. This allows search engines to discover all sitemaps
 * from a single entry point.
 */

const fs = require('fs');
const path = require('path');
const { create } = require('xmlbuilder2');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://www.appraisily.com';
const OUTPUT_PATH = path.resolve(__dirname, '../dist/sitemap_index.xml');

// Define sitemaps to include in the index
// Each sitemap should have a path (relative to the site root) and optionally lastmod date
const sitemaps = [
  { 
    path: '/sitemap.xml',
    lastmod: new Date().toISOString() 
  },
  // Include known submodule sitemaps
  {
    path: '/directory/sitemap.xml',
    lastmod: new Date().toISOString()
  },
  {
    path: '/landing/sitemap.xml',
    lastmod: new Date().toISOString()
  },
  {
    path: '/screener/sitemap.xml',
    lastmod: new Date().toISOString()
  }
];

/**
 * Find sitemaps in the dist directory
 * This helps discover sitemaps that are generated during build
 */
function findSitemapsInDist() {
  const distDir = path.resolve(__dirname, '../dist');
  
  if (!fs.existsSync(distDir)) {
    console.warn('Dist directory does not exist yet, skipping scan for sitemaps');
    return [];
  }
  
  const foundSitemaps = [];
  
  // Recursive function to search for sitemap files
  function searchDir(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git'].includes(file)) {
          searchDir(filePath, path.join(relativePath, file));
        }
      } else if (file.endsWith('.xml') && file.includes('sitemap') && file !== 'sitemap_index.xml') {
        // Convert Windows path separators to URL format
        const urlPath = path.join(relativePath, file).replace(/\\/g, '/');
        foundSitemaps.push({
          path: '/' + urlPath,
          lastmod: new Date(stats.mtime).toISOString()
        });
      }
    });
  }
  
  searchDir(distDir);
  return foundSitemaps;
}

/**
 * Generate sitemap_index.xml with references to all sitemaps
 */
function generateSitemapIndex() {
  console.log('Generating sitemap_index.xml...');
  
  // Find sitemaps in the dist directory
  const discoveredSitemaps = findSitemapsInDist();
  const allSitemaps = [...sitemaps, ...discoveredSitemaps];
  
  // Deduplicate sitemaps by path
  const uniqueSitemaps = [...new Map(allSitemaps.map(item => [item.path, item])).values()];
  
  console.log(`Found ${uniqueSitemaps.length} sitemaps to include in the index`);
  
  // Create XML structure
  const xmlObj = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('sitemapindex', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
  
  // Add sitemap entries
  uniqueSitemaps.forEach(({ path, lastmod }) => {
    const sitemapElem = xmlObj.ele('sitemap')
      .ele('loc').txt(`${SITE_URL}${path}`).up();
    
    if (lastmod) {
      sitemapElem.ele('lastmod').txt(lastmod).up();
    }
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
  console.log(`Sitemap index generated at ${OUTPUT_PATH}`);
}

/**
 * Main function to run the sitemap index generation
 */
function main() {
  try {
    generateSitemapIndex();
    console.log('Sitemap index generation completed successfully!');
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    process.exit(1);
  }
}

// Run the script
main(); 