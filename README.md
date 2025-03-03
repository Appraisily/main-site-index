# Appraisily Monorepo

This monorepo contains all integrated applications for the Appraisily platform. It provides a unified development and deployment workflow while maintaining clean separation between different parts of the application.

## Repository Structure

- **main_page**: The main Appraisily website application
- **art-appraisers-landing**: Landing page for art appraisers
- **shared**: Shared components, utilities, and types used across all applications
  - **components**: Reusable UI components
  - **styles**: Shared styles and theme definitions
  - **utils**: Common utility functions
  - **types**: TypeScript type definitions and interfaces
- **scripts**: Build and utility scripts for the monorepo

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Git with support for submodules

### Initial Setup

1. Clone this repository with submodules:

```bash
git clone --recurse-submodules https://github.com/Appraisily/main-site-index.git
cd main-site-index
```

2. Install dependencies:

```bash
npm install
```

This will set up all workspace packages and create the necessary shared directories.

### Development

To start development on a specific application:

```bash
# For the main page
npm run dev:main

# For the art appraisers landing page
npm run dev:landing
```

### Building for Production

To build all applications for production:

```bash
npm run build
```

This builds all submodules and consolidates them in the `dist` directory for unified deployment.

## Working with Submodules

### Importing Shared Components and Utilities

In any submodule, you can import shared components and utilities:

```tsx
// Import a shared component
import { Button } from 'shared/components';

// Import utility functions
import { formatCurrency, isValidEmail } from 'shared/utils';

// Import types
import { User, AppraiserProfile } from 'shared/types';
```

### Adding a New Submodule

To add a new submodule to the monorepo:

1. Add it as a Git submodule:

```bash
git submodule add https://github.com/Appraisily/new-module-name.git
```

2. Add it to the workspaces in `package.json`

3. Configure its build settings and routing in the appropriate configuration files

## Deployment

The monorepo is configured for deployment to Netlify:

1. Netlify will use the `build` command defined in the root `package.json`
2. The build script consolidates all submodule builds in the `dist` directory
3. Routing is handled via the `_redirects` file created during the build process
4. Each submodule is accessible at its designated URL path

## Integration Strategy

This monorepo follows the strategy outlined in [MONOREPO_INTEGRATION_PLAN.md](./MONOREPO_INTEGRATION_PLAN.md), which provides a detailed roadmap for the integration process.

## Development Guidelines

When working in this monorepo:

1. **Keep submodules clean**: Only add code to a submodule that is specific to that application
2. **Use shared code**: If functionality could be reused, add it to the appropriate shared directory
3. **Maintain typings**: Always use TypeScript for type safety across submodules
4. **Document changes**: Keep documentation up-to-date as you make changes
5. **Test thoroughly**: Ensure changes don't break other parts of the application

## Troubleshooting

### Common Issues

- **Submodule changes not reflected**: Make sure you're on the right branch in each submodule and have pulled the latest changes
- **Workspace package not found**: Run `npm install` from the root directory again
- **Build failing**: Check that all dependencies are installed and that each submodule builds correctly individually

## License

This project is proprietary and confidential. All rights reserved. 