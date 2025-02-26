# Appraisily Monorepo

This repository contains multiple Appraisily projects as Git submodules that are deployed as a single application on Netlify.

## Structure

The repository contains the following submodules:

- `main_page`: The main Appraisily website
- `art-appraiser-directory-frontend`: The art appraiser directory site

## Routes

The combined application has the following route structure:

- `/` - Main website (from `main_page` submodule)
- `/directory/*` - Art appraiser directory (from `art-appraiser-directory-frontend` submodule)
- `/location/*` - Location-specific pages from the directory, redirected to `/directory/location/*`
- `/appraiser/*` - Appraiser-specific pages from the directory, redirected to `/directory/appraiser/*`

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
2. Building each submodule individually
3. Merging the builds into a unified structure in the `dist` directory

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

## Updating Submodules

To update all submodules to their latest versions:

```bash
git submodule update --remote
``` 