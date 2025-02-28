# Automated Appraiser Image Generation System

This document provides a comprehensive guide for implementing and using the automated image generation system for art appraiser profiles.

## Overview

The system automatically identifies art appraisers without profile images, generates personalized professional images using the image generation service, and updates the appraiser data before building the directory.

## Quick Start

To build the directory with automatic image generation:

```bash
# Run the full build with image generation
npm run build-with-images
```

This will:
1. Find appraisers without images
2. Generate missing images (limited to 20 per build by default to control costs)
3. Build the art-appraiser-directory with the updated image URLs

## Manual Process

If you prefer to run the steps manually:

```bash
# Step 1: Find the appraiser data location
npm run find-data

# Step 2: (Optional) Create test data if needed
npm run create-test

# Step 3: Identify appraisers without images
npm run identify

# Step 4: Generate images for identified appraisers
npm run generate

# Step 5: Build the directory
npm run build:directory
```

## Implementation Details

### 1. Scripts

The system consists of the following scripts:

- **find-appraiser-data.js**: Locates where appraiser data is stored in the repository
- **create-test-data.js**: Creates sample appraiser data for testing
- **identify-missing-images.js**: Identifies appraisers without images
- **generate-appraiser-images.js**: Generates images for appraisers and updates data
- **build-with-images.js**: Orchestrates the complete build process with image generation

### 2. Configuration

Key configuration options in `scripts/build-with-images.js`:

```javascript
const CONFIG = {
  // Control whether to actually generate images or just simulate
  generateImages: true,
  // Maximum number of images to generate in one build (to control costs)
  maxImagesToGenerate: 20
};
```

Adjust these values to control:
- Whether to actually generate images or just simulate the process
- How many images to generate per build (to control costs)

### 3. Directory Structure

```
main-site-index/
├── art-appraiser-directory-frontend/  # Directory frontend code
├── data/                              # Appraiser data
│   └── appraisers.json                # Appraiser data file
├── logs/                              # Generation logs
├── scripts/                           # Image generation scripts
│   ├── build-with-images.js
│   ├── create-test-data.js
│   ├── find-appraiser-data.js
│   ├── generate-appraiser-images.js
│   └── identify-missing-images.js
└── temp/                              # Temporary files
    └── appraisers-needing-images.json # List of appraisers needing images
```

### 4. Data Format

The appraiser data should be in the following format:

```json
{
  "appraisers": [
    {
      "id": "unique-id",
      "firstName": "First",
      "lastName": "Last",
      "company": "Company Name",
      "state": "State",
      "licenseNumber": "License",
      "specialties": ["Specialty1", "Specialty2"],
      "imageUrl": "" // Will be populated by the script
    }
  ]
}
```

### 5. Image Generation Service

The system uses the image generation service at:
```
https://image-generation-service-856401495068.us-central1.run.app/api/generate
```

The service:
- Takes appraiser data as input
- Generates a professional portrait based on the appraiser's characteristics
- Returns an image URL hosted on ImageKit CDN

## Integration with Build Process

The system is fully integrated with the build process:

- `npm run build-with-images` replaces the standard `npm run build:directory` step with an enhanced version that includes image generation
- Images are generated before the directory build so that they are included in the built site
- The process is designed to be incremental, only generating images for appraisers who don't already have them

## Cost Control Measures

Several measures are in place to control the cost of image generation:

1. **Incremental Generation**: Only generates images for appraisers without existing images
2. **Image Limit**: Caps the number of images generated per build (default: 20)
3. **Skip Option**: Can be configured to skip image generation entirely during development

## Error Handling

The system includes robust error handling:

- Continues with the build even if image generation fails
- Creates backups of appraiser data before making changes
- Logs detailed information about successes and failures

## Logs and Monitoring

Detailed logs are generated at:

- Console output during the build process
- `logs/image-generation-[timestamp].json` for detailed results of each generation run

## Troubleshooting

Common issues and solutions:

1. **Cannot find appraiser data**: Run `npm run find-data` to locate the data or create test data with `npm run create-test`
2. **Image generation fails**: Check if the image generation service is accessible
3. **Build fails**: The build process will continue even if image generation fails, but check the logs for details

## Customization

To customize the image generation process:

1. Edit `CONFIG` in `scripts/build-with-images.js` to adjust limits and settings
2. Modify the payload in `scripts/generate-appraiser-images.js` to change what data is sent to the image generation service

## Development Workflow

During development:

1. Set `generateImages: false` in the CONFIG object to disable actual image generation
2. Use `npm run find-data` to check the current state of appraiser data
3. Test individual scripts before running the full build

## Production Deployment

For production deployment:

1. Ensure the image generation service is accessible from the build environment
2. Consider adding the image generation logs to your monitoring system
3. Verify that ImageKit CDN is properly configured to serve the generated images

## Next Steps and Improvements

Future improvements could include:

1. Adding a webhook to trigger image generation when appraiser data changes
2. Implementing a cache invalidation system to regenerate images when needed
3. Adding more advanced appraiser analysis to better customize generated images 