const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const prettier = require('prettier');

// Base URL for the production site
const BASE_URL = 'https://www.appraisily.com';

// Main paths to scan for routes
const STATIC_ROUTES = [
  // Main routes from main_page
  '/',
  '/about',
  '/team',
  '/services',
  '/expertise',
  '/how-it-works',
  '/terms',
  
  // Directory base route
  '/directory',
  
  // Screener base route
  '/screener',
  
  // Landing page base routes
  '/art-appraiser',
  '/painting-value',
];

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Initialize an array to store all routes
  let allRoutes = [...STATIC_ROUTES];
  
  try {
    // Get dynamic routes from submodules if available
    await collectRoutesFromMainPage();
    await collectRoutesFromDirectory();
    await collectRoutesFromLanding();
    await collectRoutesFromScreener();
    
    // Remove duplicates
    allRoutes = [...new Set(allRoutes)];
    
    // Generate the XML sitemap
    const sitemap = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allRoutes
          .map(route => {
            return `
              <url>
                <loc>${BASE_URL}${route}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>${route === '/' ? '1.0' : '0.8'}</priority>
              </url>
            `;
          })
          .join('')}
      </urlset>
    `;
    
    // Format the XML
    const formattedSitemap = prettier.format(sitemap, {
      parser: 'html',
      printWidth: 100,
    });
    
    // Write the sitemap to the output directory
    const outputDir = path.resolve(__dirname, '../dist');
    await fs.ensureDir(outputDir);
    await fs.writeFile(path.join(outputDir, 'sitemap.xml'), formattedSitemap);
    
    // Also write a routes.json file for internal use/reference
    await fs.writeFile(
      path.join(outputDir, 'routes.json'),
      JSON.stringify({ routes: allRoutes.sort() }, null, 2)
    );
    
    console.log(`Sitemap generated with ${allRoutes.length} routes`);
    console.log('Sitemap saved to dist/sitemap.xml');
    console.log('Route list saved to dist/routes.json');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
  
  // Helper function to collect routes from main_page
  async function collectRoutesFromMainPage() {
    try {
      const mainPageAppFile = path.resolve(__dirname, '../main_page/src/App.tsx');
      
      if (await fs.pathExists(mainPageAppFile)) {
        const content = await fs.readFile(mainPageAppFile, 'utf8');
        // Extract routes from React Router Route components
        const routeMatches = content.match(/<Route\s+path=["']([^"']+)["']/g) || [];
        
        for (const match of routeMatches) {
          const routePath = match.match(/<Route\s+path=["']([^"']+)["']/)?.[1];
          if (routePath && !routePath.includes('*') && !routePath.startsWith(':')) {
            allRoutes.push(routePath);
          }
        }
      }
    } catch (error) {
      console.warn('Could not collect routes from main_page:', error.message);
    }
  }
  
  // Helper function to collect routes from directory
  async function collectRoutesFromDirectory() {
    try {
      const directoryRouterFile = path.resolve(__dirname, '../art-appraiser-directory-frontend/src/router.tsx');
      
      if (await fs.pathExists(directoryRouterFile)) {
        const content = await fs.readFile(directoryRouterFile, 'utf8');
        
        // Extract routes from React Router path definitions
        const routeMatches = content.match(/path:\s*['"]([^'"*]+)['"]/g) || [];
        
        for (const match of routeMatches) {
          let routePath = match.match(/path:\s*['"]([^'"*]+)['"]/)?.[1];
          if (routePath && routePath !== '/') {
            // Handle directory routes
            if (!routePath.startsWith('/')) {
              routePath = `/directory/${routePath}`;
            }
            allRoutes.push(routePath);
          }
        }
      }
      
      // Also try to discover any dynamic location pages from data if available
      const locationDataPath = path.resolve(__dirname, '../art-appraiser-directory-frontend/src/data');
      if (await fs.pathExists(locationDataPath)) {
        const dataFiles = await globby(['*.json', '*.js'], { cwd: locationDataPath });
        
        for (const file of dataFiles) {
          try {
            if (file.endsWith('.json')) {
              const data = await fs.readJson(path.join(locationDataPath, file));
              if (data.locations) {
                data.locations.forEach(location => {
                  if (location.slug) {
                    allRoutes.push(`/location/${location.slug}`);
                  }
                });
              }
              if (data.appraisers) {
                data.appraisers.forEach(appraiser => {
                  if (appraiser.id) {
                    allRoutes.push(`/appraiser/${appraiser.id}`);
                  }
                });
              }
            }
          } catch (err) {
            console.warn(`Could not process data file ${file}:`, err.message);
          }
        }
      }
    } catch (error) {
      console.warn('Could not collect routes from directory:', error.message);
    }
  }
  
  // Helper function to collect routes from landing pages
  async function collectRoutesFromLanding() {
    try {
      const landingPagesDir = path.resolve(__dirname, '../art-appraisers-landing/src/pages');
      
      if (await fs.pathExists(landingPagesDir)) {
        const pageFiles = await globby(['**/*.tsx', '**/*.jsx'], { cwd: landingPagesDir });
        
        for (const file of pageFiles) {
          // Convert filename to route
          const routePath = `/art-appraiser/${file.replace(/\.(tsx|jsx)$/, '')}`;
          allRoutes.push(routePath);
        }
      }
    } catch (error) {
      console.warn('Could not collect routes from landing pages:', error.message);
    }
  }
  
  // Helper function to collect routes from screener
  async function collectRoutesFromScreener() {
    try {
      const screenerPagesDir = path.resolve(__dirname, '../screener-page-module/src/pages');
      
      if (await fs.pathExists(screenerPagesDir)) {
        const pageFiles = await globby(['**/*.tsx', '**/*.jsx'], { cwd: screenerPagesDir });
        
        for (const file of pageFiles) {
          // Convert filename to route
          const routePath = `/screener/${file.replace(/\.(tsx|jsx)$/, '')}`;
          allRoutes.push(routePath);
        }
      }
    } catch (error) {
      console.warn('Could not collect routes from screener pages:', error.message);
    }
  }
}

// Run the sitemap generator
generateSitemap(); 