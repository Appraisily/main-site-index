import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

/**
 * A simplified build script that bypasses image checking
 * It performs the basic steps needed to build the app:
 * 1. TypeScript compilation
 * 2. Vite build
 * 3. Static HTML generation
 * 4. Copying files
 */

console.log('🚀 Starting simplified build process...');

// Set the image generation service URL
const imageServiceUrl = process.env.IMAGE_GENERATION_API || 'https://image-generation-service-856401495068.us-central1.run.app/api/generate';
console.log(`📡 Using image generation service at: ${imageServiceUrl}`);
process.env.IMAGE_GENERATION_API = imageServiceUrl;

try {
  // Step 1: TypeScript compilation and Vite build
  console.log('\n📦 Building React application...');
  execSync('tsc && vite build', { 
    stdio: 'inherit', 
    cwd: ROOT_DIR,
    env: { ...process.env }
  });
  
  // Step 2: Generate static HTML files
  console.log('\n🌐 Generating static HTML files...');
  execSync('node scripts/generate-static.js', { 
    stdio: 'inherit', 
    cwd: ROOT_DIR,
    env: { ...process.env } 
  });
  
  // Step 3: Copy necessary files (like 404.html)
  console.log('\n📝 Copying static files...');
  execSync('node scripts/copy-static.js', { 
    stdio: 'inherit', 
    cwd: ROOT_DIR,
    env: { ...process.env } 
  });
  
  // Step 4: Generate sitemap (optional)
  console.log('\n🗺️ Generating sitemap...');
  try {
    execSync('node scripts/generate-sitemap.js', { 
      stdio: 'inherit', 
      cwd: ROOT_DIR,
      env: { ...process.env } 
    });
  } catch (error) {
    console.warn('⚠️ Sitemap generation failed. Continuing without sitemap...');
  }
  
  console.log('\n✅ Build completed successfully!');
  console.log('\n🔍 The built files are in the dist/ directory.');
  console.log('   To deploy to Netlify, use the contents of this directory.');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 