# Appraisily Monorepo

This repository contains multiple Appraisily projects as Git submodules that are deployed as a single application on Netlify.

## Structure

The repository contains the following submodules:

- `main_page`: The main Appraisily website
- `art-appraiser-directory-frontend`: The art appraiser directory site
- `art-appraisers-landing`: Landing pages for art appraisers
- `screener-page-module`: Appraisal screener pages for user qualification
- `image-generation-service`: AI image generation service for appraiser and location profiles

## Routes

The combined application has the following route structure:

- `/` - Main website (from `main_page` submodule)
- `/directory/*` - Art appraiser directory (from `art-appraiser-directory-frontend` submodule)
- `/location/*` - Location-specific pages from the directory, redirected to `/directory/location/*`
- `/appraiser/*` - Appraiser-specific pages from the directory, redirected to `/directory/appraiser/*`
- `/art-appraiser/*` - Art appraiser landing pages, redirected to `/landing/art-appraiser/*`
- `/painting-value/*` - Painting value landing pages, redirected to `/landing/painting-value/*`
- `/screener/*` - Appraisal screener pages (from `screener-page-module` submodule)

### Route Tracking and Sitemap

The repo includes an automatic route tracking system that scans all submodules to generate:

1. A comprehensive `sitemap.xml` file for SEO purposes
2. A `routes.json` file listing all available routes

These files are automatically generated during the build process and placed in the `dist` directory.

To manually generate the route tracking files:

```bash
npm run routes
```

The route tracking system works by:
- Statically defining common routes
- Scanning React Router configurations in each submodule
- Parsing component files to detect page routes
- Analyzing data files to detect dynamic routes

## AI Image Generation System

The repository includes an advanced AI image generation system that automatically creates professional images for both appraisers and locations in the directory.

### Appraiser Profile Images

The system automatically generates professional portrait images for art appraisers:

1. Scans the appraiser directory for profiles without images during the build process
2. Generates photorealistic portrait images using Flux Ultra model
3. Integrates the generated images into the directory build
4. Updates appraiser data with ImageKit CDN URLs

### Location Images

The system also generates professional images for gallery, museum, and office locations:

1. Identifies locations without images in the directory data
2. Generates type-specific images tailored to:
   - **Galleries**: Modern art galleries with exhibition spaces
   - **Museums**: Classical museum architecture with grand entrances
   - **Auction Houses**: Elegant auction venues with refined facades
   - **Offices**: Professional office buildings with clean entrances
3. Customizes the images based on location details (name, city, features)
4. Updates location data with persistent ImageKit CDN URLs

For detailed documentation on the image generation system, see [APPRAISER_IMAGES.md](./APPRAISER_IMAGES.md).

## Development

### Prerequisites

- Node.js v20 or higher
- npm

### Setup

1. Clone this repository with submodules:

```bash
git clone --recurse-submodules https://github.com/your-org/main-site-index.git
cd main-site-index
```

2. Install dependencies:

```bash
npm install
```

### Build Process

#### Standard Build
The standard build process compiles all submodules without generating images:

```bash
npm run build
```

#### Build with Image Generation
To build with automatic image generation for appraisers and locations:

```bash
npm run build-with-images
```

This comprehensive build process:

1. Applies patches to submodules (router basenames, etc.)
2. Identifies appraisers and locations without images
3. Generates missing images using the AI image generation service
4. Updates data files with new image URLs
5. Builds each submodule individually
6. Merges all builds into a unified structure in the `dist` directory
7. Generates the sitemap and route tracking files

### Testing Image Generation

To test the image generation system in isolation:

```bash
# Create test data
npm run create-test         # For appraisers
npm run create-test-locations  # For locations

# Identify entities without images
npm run identify            # For appraisers
npm run identify-locations  # For locations

# Generate images
npm run generate            # For appraisers
npm run generate-locations  # For locations
```

## Deployment

The site is configured to deploy on Netlify. The `netlify.toml` file contains:

- Build configuration
- Redirects to handle routing between the different apps
- Security headers

### Deployment Workflow

1. Run the build-with-images command to generate a complete build with all images
2. Deploy the contents of the `dist` directory to Netlify
3. Verify that all routes and redirects are working correctly

## Adding New Submodules

To add a new submodule:

1. Add the Git submodule:

```bash
git submodule add https://github.com/your-org/new-project.git
```

2. Update the build scripts in `package.json` to include the new submodule
3. Modify `scripts/merge-builds.js` to include the new submodule in the merged build
4. Add appropriate redirects in `netlify.toml`
5. Update the route tracking system in `scripts/generate-sitemap.js` to include routes from the new submodule

## Updating Submodules

To update all submodules to their latest versions:

```bash
git submodule update --remote
```

## Image Generation Service

The image generation service is a separate component that provides AI-generated images via API endpoints:

- `/api/generate` - For appraiser profile images
- `/api/generate-location` - For location images (galleries, museums, offices)

The service is deployed as a Cloud Run instance with the following features:

- Black Forest AI integration for high-quality image generation
- ImageKit CDN for global image delivery and persistence
- Prompt optimization with GPT-4o when available
- Fallback mechanisms for high availability

### Local Development of the Image Service

To develop the image generation service locally:

```bash
cd image-generation-service
npm install
npm run dev
```

Test endpoints with provided scripts:

```bash
# Test appraiser image generation
node test-images.js

# Test location image generation
node test-location-images.js
```

## Configuration Options

The build system includes several configuration options in `scripts/build-with-images.js`:

```javascript
const CONFIG = {
  // Control whether to actually generate images or just simulate
  generateImages: true,
  // Maximum number of images to generate in one build (to control costs)
  maxImagesToGenerate: 20,
  // Enable location image generation
  generateLocationImages: true
};
```

These options allow control over:

- Whether to generate images or just simulate the process (for testing)
- How many images to generate per build (to control costs)
- Whether to include location image generation

## Troubleshooting

Common issues and solutions:

- **Missing appraiser data**: Run `npm run find-data` to locate the appraiser data file
- **Image generation failures**: Check the logs in the `logs` directory for detailed error information
- **Build failures**: Verify that all submodules are properly initialized and that patches apply cleanly
- **Network issues**: Ensure the image generation service is accessible from your environment

For more detailed troubleshooting, consult the logs generated during the build process.

# Appraiser Image Generation Solution

This project provides tools to efficiently generate and manage professional profile images for art appraisers in the directory. The solution is designed to minimize the cost of image generation by only generating images that don't already exist.

## Features

- **Identifies Missing Images**: Analyzes the appraiser data to identify which appraisers need profile images.
- **Batch Processing**: Processes appraisers in batches with controlled concurrency to avoid overwhelming the image generation service.
- **Persistent Storage**: Generated images are stored in ImageKit CDN for fast global delivery.
- **Data Management**: Updates appraiser data with the URLs of generated images.
- **Comprehensive Logging**: Tracks the image generation process and results for auditing and troubleshooting.

## Prerequisites

- Node.js v14 or higher
- Access to the image generation service
- ImageKit CDN for image storage
- Appraiser data in JSON format

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Ensure the image generation service is running or accessible via the URL in the configuration

## Usage

The solution consists of three main scripts:

### 1. Create Test Data (for Testing Only)

Creates sample appraiser data for testing the workflow.

```
npm run create-test
```

or

```
node scripts/create-test-data.js
```

### 2. Identify Missing Images

Scans the appraiser data and identifies which appraisers need images.

```
npm run identify
```

or

```
node scripts/identify-missing-images.js
```

This creates a JSON file with the list of appraisers who need images in the `temp` directory.

### 3. Generate Images

Processes the list of appraisers who need images, calls the image generation service, and updates the appraiser data with the image URLs.

```
npm run generate
```

or

```
node scripts/generate-appraiser-images.js
```

## Configuration

The scripts use configuration objects that can be adjusted:

- **Image Service URL**: Change the URL of the image generation service in `generate-appraiser-images.js`.
- **Batch Size**: Adjust the number of appraisers processed in each batch.
- **Concurrency**: Control how many simultaneous API calls are made.
- **Delay**: Set the delay between API calls to avoid throttling.

## Workflow

1. Run the identify script to find appraisers who need images
2. Review the output JSON file to confirm the list of appraisers
3. Run the generate script to create images for these appraisers
4. Check the logs directory for detailed results of the image generation process

## Example Output

The scripts provide detailed console output and generate log files:

```
Starting appraiser image generation...
Using image service: https://image-generation-service-856401495068.us-central1.run.app/api/generate
Found 5 appraisers needing images.
Processing 5 appraisers in 1 batches...
Processing batch 1 of 1 (5 appraisers)
Generating image for appraiser: John Smith (test-001)
Generating image for appraiser: Jane Doe (test-002)
Generating image for appraiser: Robert Johnson (test-003)
...
```

## Troubleshooting

- If the image generation service is unavailable, check the service status and URL.
- For authentication issues, ensure the service has proper credentials.
- If images are not being saved to ImageKit, verify the ImageKit configuration in the image generation service.

## Contributing

Improvements and bug fixes are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request 