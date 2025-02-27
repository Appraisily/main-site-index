# Appraisily Monorepo

This repository contains multiple Appraisily projects as Git submodules that are deployed as a single application on Netlify.

## Structure

The repository contains the following submodules:

- `main_page`: The main Appraisily website
- `art-appraiser-directory-frontend`: The art appraiser directory site
- `art-appraisers-landing`: Landing pages for art appraisers
- `screener-page-module`: Appraisal screener pages for user qualification
- `image-generation-service`: AI image generation service for appraiser profiles

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

### Appraiser Profile Image Generation

The repository includes an AI image generation system that automatically creates professional profile images for art appraisers who don't have one. This system:

1. Scans the appraiser directory for profiles without images during the build process
2. Generates photorealistic profile images using Google's Vertex AI
3. Integrates the generated images into the directory build
4. Implements intelligent caching to avoid unnecessary regeneration

The image generation process uses appraiser data (gender, specialization, etc.) to create tailored images that match the appraiser's profile. Generated images are stored both locally and in Google Cloud Storage for persistence between builds.

For more information, see the [Image Generation Service README](./image-generation-service/README.md).

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

The build process involves:

1. Applying patches to submodules (like setting the correct base paths)
2. Initializing the image generation service and generating appraiser profile images
3. Building each submodule individually
4. Merging the builds into a unified structure in the `dist` directory
5. Generating the sitemap and route tracking files

To build the project:

```bash
npm run build
```

## Deployment

The site is configured to deploy on Netlify. The `netlify.toml` file contains:

- Build configuration
- Redirects to handle routing between the different apps
- Security headers

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