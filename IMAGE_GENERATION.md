# Image Generation for Art Appraiser Directory

This document explains how the automatic image generation feature works in the Art Appraiser Directory.

## Overview

The Art Appraiser Directory now includes an automatic image generation feature that:

1. Identifies appraisers without proper images
2. Generates custom images for them using AI
3. Updates the appraiser data with the new image URLs

## How It Works

The process is fully integrated into the build pipeline:

1. When you run `npm run build`, the system will:
   - Build the React application
   - Check for appraisers with missing or improperly formatted images
   - Generate new images for those appraisers using the image generation service
   - Update the appraiser data files with the new image URLs
   - Generate the static HTML files
   - Copy the static files to the distribution directory

## Configuration

### Image Generation Service URL

By default, the script looks for the image generation service at `http://localhost:3000/api/generate`. 

You can set a custom URL by setting the `IMAGE_GENERATION_API` environment variable:

```bash
# Windows
$env:IMAGE_GENERATION_API="http://your-image-service-url/api/generate"

# Linux/Mac
export IMAGE_GENERATION_API="http://your-image-service-url/api/generate"
```

## Manual Usage

If you want to manually fix missing images without doing a full build:

```bash
npm run fix-images
```

After running this command, you should regenerate the static files:

```bash
npm run rebuild-static
```

## Image Filename Format

The generated images follow this filename pattern:

```
appraiser_{appraiser.id}_{timestamp}_V{randomId}.jpg
```

For example:
```
appraiser_chicago-prestige-estate-services_1635789012345_Vx4f2z9b.jpg
```

This ensures each image has a unique name tied to the specific appraiser.

## Troubleshooting

If you encounter issues with image generation:

1. Make sure the image generation service is running and accessible
2. Check the console output for specific error messages
3. Look for fallback placeholder images in the generated HTML

If images fail to generate, the system will use a placeholder image as a fallback. 