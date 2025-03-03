# Monorepo Integration Plan

## Overview

This document outlines the strategy for integrating multiple submodules into a cohesive monorepo structure. The goal is to simplify development workflows, standardize build processes, and enable unified deployment while maintaining separation of concerns.

Currently, two submodules are integrated:
- `main_page` - The primary website application
- `art-appraisers-landing` - Landing page for art appraisers

Future submodules will be added following the patterns established in this document.

## Current Architecture Analysis

### Main Page Submodule
- **Technology**: React with TypeScript, Vite build system
- **Routing**: Uses react-router-dom for client-side routing
- **Styling**: Tailwind CSS
- **Deployment**: Netlify with specific site ID
- **Special Features**: Edge functions, client-side routing

### Art Appraisers Landing Submodule
- **Technology**: React with TypeScript, Vite build system
- **Routing**: Uses react-router-dom for specific routes (/art-appraiser/*, /painting-value/*)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify with different site ID
- **Special Features**: Optimized for landing page performance

## Integration Challenges

1. **Routing Conflicts**: Both submodules use react-router-dom with wildcards
2. **Build Process**: Each submodule has its own build configuration
3. **Dependency Management**: Potential for duplicated or conflicting dependencies
4. **Deployment Strategy**: Currently each has its own Netlify configuration
5. **Path Resolution**: Ensuring imports work correctly across submodules
6. **Asset Management**: Handling shared vs. submodule-specific assets

## Integration Strategy

### 1. Repository Structure & Organization

- [x] Maintain submodules in their own directories
- [x] Create a shared directory for common components, utilities, and types
  - [x] `shared/components/` - Reusable UI components
  - [x] `shared/styles/` - Common styles, Tailwind presets
  - [x] `shared/utils/` - Helper functions
  - [x] `shared/types/` - TypeScript interfaces and types
- [x] Implement consistent naming conventions across all submodules
- [x] Establish clear documentation for adding new submodules

### 2. Build System Integration

- [x] Create a root-level package.json with scripts to:
  - [x] Build all submodules with a single command
  - [x] Run development servers for specific submodules
  - [x] Run tests across all submodules
- [x] Implement a workspace setup (using npm workspaces or similar)
- [x] Standardize build configurations while allowing submodule-specific customization
- [x] Create build-time validation to ensure compatibility

Example root package.json:
```json
{
  "name": "appraisily-monorepo",
  "private": true,
  "workspaces": [
    "main_page",
    "art-appraisers-landing",
    "shared/*"
  ],
  "scripts": {
    "build:all": "npm run build --workspaces",
    "build:main": "npm run build --workspace=main_page",
    "build:landing": "npm run build --workspace=art-appraisers-landing",
    "dev:main": "npm run dev --workspace=main_page",
    "dev:landing": "npm run dev --workspace=art-appraisers-landing"
  }
}
```

### 3. Routing Integration

- [x] Implement a unified routing strategy with path prefixes for each submodule
  - [x] Main page: `/` (root routes)
  - [x] Art appraisers landing: `/art-appraisers/`
- [ ] Create a root-level routing configuration that imports and combines all submodule routes
- [ ] Implement a route registry system for dynamically registering routes from each submodule
- [x] Ensure all redirects work properly when deployed

### 4. Dependency Management

- [x] Move common dependencies to the root package.json
- [x] Ensure version consistency across all submodules
- [x] Implement a dependency update strategy that respects semver
- [x] Document the process for adding new dependencies

### 5. Deployment Strategy

- [x] Create a unified Netlify configuration at the root level
- [x] Configure build commands to properly build all submodules
- [x] Set up proper routing and redirects for all submodules
- [x] Implement environment variable management
- [x] Create deployment pipelines for staging and production

Example unified netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  ignore = "git diff --quiet HEAD^ HEAD -- ./main_page ./art-appraisers-landing"

[build.environment]
  NODE_VERSION = "18"
  SECRETS_SCAN_ENABLED = "false"

# Handle submodule-specific routing
[[redirects]]
  from = "/art-appraisers/*"
  to = "/art-appraisers-landing/dist/index.html"
  status = 200

[[redirects]]
  from = "/painting-value/*"
  to = "/art-appraisers-landing/dist/painting-value/index.html"
  status = 200

# General SPA redirect
[[redirects]]
  from = "/*"
  to = "/main_page/dist/index.html"
  status = 200
```

### 6. Shared Resources & Code

- [x] Create a shared component library
- [x] Implement a design system for consistent UI
- [x] Establish patterns for inter-submodule communication
- [x] Set up shared state management if needed
- [x] Create shared utilities for common tasks
- [ ] Implement shared authentication if required

### 7. CI/CD Pipeline

- [x] Set up GitHub Actions workflows for:
  - [x] Linting and type checking
  - [x] Testing
  - [x] Building
  - [x] Deployment to staging and production
- [ ] Implement branch-based preview deployments
- [ ] Set up automated dependency updates
- [x] Implement quality gates for PRs

### 8. Development Workflow

- [x] Document the development workflow
  - [x] How to start development on a specific submodule
  - [x] How to test changes across submodules
  - [x] How to create new submodules
- [x] Create templates for new submodules
- [x] Establish code review guidelines
- [x] Implement pre-commit hooks for code quality

## Implementation Plan

### Phase 1: Initial Setup (Complete)
- [x] Set up the monorepo with initial submodules
- [x] Document the existing architecture

### Phase 2: Build & Dependency Integration (Complete)
- [x] Create root package.json with workspaces
- [x] Standardize build configurations
- [x] Move common dependencies to root
- [x] Set up shared directory structure

### Phase 3: Routing & Deployment (Complete)
- [x] Implement unified routing strategy
- [x] Create consolidated Netlify configuration
- [x] Test deployment with both submodules

### Phase 4: Shared Components & Utilities (Complete)
- [x] Create shared component library
- [x] Implement shared utilities
- [x] Establish TypeScript type sharing

### Phase 5: CI/CD & Quality (Complete)
- [x] Set up GitHub Actions workflows
- [x] Implement quality gates
- [x] Create documentation

### Phase 6: New Submodule Integration (Complete)
- [x] Create templates for new submodules
- [x] Document process for adding submodules
- [x] Implement automated testing for integration

## Adding New Submodules

To add a new submodule to the monorepo:

1. Run the create-submodule script:
   ```bash
   npm run create-submodule my-new-submodule "My New Submodule"
   ```

2. This will:
   - Create a new submodule with the appropriate structure
   - Set up all necessary configuration files
   - Update the root package.json with appropriate scripts
   - Update the Netlify configuration with appropriate redirects
   - Update the build script to include the new submodule

3. Start developing in your new submodule:
   ```bash
   cd my-new-submodule
   npm install
   npm run dev
   ```

## Appendix: Technologies & Standards

### Core Technologies
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Netlify

### Coding Standards
- ESLint configuration shared across all submodules
- Prettier for consistent formatting
- TypeScript strict mode
- Component-based architecture
- Semantic versioning for all dependencies

### Documentation Standards
- README.md in each submodule
- JSDoc for all shared utilities and components
- Storybook for component documentation (future)
- Architectural decision records (ADRs) for significant decisions 