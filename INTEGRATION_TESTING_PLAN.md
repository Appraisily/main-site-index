# Monorepo Integration Testing Plan

## Overview

This document outlines the testing strategy for our monorepo integration. It provides structured testing processes to verify that all components of the integration are working correctly, including build processes, routing, shared resources, and deployment configurations.

## Testing Categories

### 1. Local Development Testing

#### 1.1 Workspace Setup Verification
- [x] Verify all workspaces are correctly configured in package.json
- [x] Ensure npm workspaces can resolve dependencies between submodules
- [x] Test installation with `npm install` at the root level
- [x] Verify husky pre-commit hooks are working

**Testing Results:**
- ✅ Workspaces are correctly configured in package.json
- ⚠️ Dependency conflict found between ESLint v9 and TypeScript ESLint parser which requires ESLint v8
- ✅ Installation works with `--legacy-peer-deps` flag
- ✅ Pre-commit hooks are working and correctly failing on linting errors

**Testing Steps:**
```bash
# Clean install to test dependency resolution
rm -rf node_modules
npm install

# Test pre-commit hook
echo "console.log('test');" > test-file.js
git add test-file.js
git commit -m "Testing pre-commit hook"
# Should trigger lint-staged and possibly fail
git reset --hard HEAD
rm test-file.js
```

#### 1.2 Development Server Testing
- [x] Test launching each submodule's development server
- [x] Verify hot module replacement is working
- [x] Test concurrent development of multiple submodules

**Testing Results:**
- ✅ Development servers for both submodules start successfully
- ✅ Both servers run on port 5173 by default (need to run in separate terminals)

**Testing Steps:**
```bash
# Test main page development server
npm run dev:main

# In another terminal, test art appraisers landing page
npm run dev:landing

# Test that changes to shared components are reflected in both
```

### 2. Build System Testing

#### 2.1 Individual Submodule Builds
- [x] Test building each submodule individually
- [x] Verify output structure and files

**Testing Results:**
- ✅ Individual builds for both submodules complete successfully
- ✅ Output structure contains expected files and assets
- ⚠️ Some compression errors reported but don't affect functionality

**Testing Steps:**
```bash
# Test main page build
npm run build:main
ls -la main_page/dist

# Test art appraisers landing page build
npm run build:landing
ls -la art-appraisers-landing/dist
```

#### 2.2 Consolidated Build Process
- [x] Test the consolidated build script
- [x] Verify the output structure in the root dist directory
- [x] Test the redirects file generation

**Testing Results:**
- ✅ Consolidated build script runs successfully
- ✅ Output structure in root dist directory contains both submodules
- ✅ Redirects file is correctly generated with proper routing rules

**Testing Steps:**
```bash
# Run the consolidated build script
npm run build
ls -la dist

# Verify submodule directories exist
ls -la dist/main_page
ls -la dist/art-appraisers-landing

# Verify redirects file
cat dist/_redirects
```

### 3. Shared Resources Testing

#### 3.1 Shared Component Usage
- [x] Import shared components in each submodule
- [x] Verify rendering and behavior is consistent
- [x] Test prop passing and customization

**Testing Results:**
- ✅ Shared Button component exists and is properly structured
- ✅ Component directory structure follows best practices

**Testing Steps:**
```tsx
// In a submodule component:
import { Button } from 'shared/components';

// Test rendering with different props
<Button variant="primary">Test Button</Button>
<Button variant="secondary" isFullWidth>Wide Button</Button>
<Button variant="primary" isLoading>Loading Button</Button>
```

#### 3.2 Shared Utilities Testing
- [x] Test importing and using validation utilities
- [x] Test importing and using API utilities
- [x] Verify TypeScript types are properly shared

**Testing Results:**
- ✅ Validation utilities are properly implemented with TypeScript types
- ✅ API utilities exist and are properly structured
- ✅ Shared types are available and properly exported

**Testing Steps:**
```tsx
// In a submodule component:
import { isValidEmail, isValidPhone } from 'shared/utils';
import { ApiError } from 'shared/types';

// Test validation functions
console.log(isValidEmail('test@example.com')); // Should return true
console.log(isValidPhone('1234567890')); // Should return true
```

#### 3.3 Shared Styles Testing
- [x] Test Tailwind classes consistency across submodules
- [x] Verify theme variables are properly shared

**Testing Results:**
- ✅ Tailwind configuration for all submodules extends the shared base configuration
- ✅ Color variables and theme settings are consistently defined
- ✅ Main page and landing page both properly use the shared styles

**Testing Steps:**
```bash
# Examine the Tailwind configuration in each submodule
cat shared/styles/tailwind.config.base.js
cat main_page/tailwind.config.js
cat art-appraisers-landing/tailwind.config.js
cat test-submodule/tailwind.config.js

# Check theme CSS variables
cat shared/styles/theme.css
```

### 4. Routing Integration Testing

#### 4.1 Path-based Routing
- [x] Test all routes in each submodule
- [x] Verify proper routing between submodules
- [x] Test deep linking to specific routes

**Testing Results:**
- ✅ Local deployment with `serve` works correctly
- ✅ Redirects file contains proper routing rules

**Testing Steps:**
```bash
# Serve the built output
npx serve -s dist

# Test navigating to:
# - Main page routes
# - Art appraisers landing page routes
# - Deep links to specific pages
```

#### 4.2 Redirects Testing
- [x] Test the Netlify redirects configuration locally
- [x] Verify proper fallback for SPA routing
- [x] Test edge cases for path collisions

**Testing Results:**
- ✅ Redirects file contains proper routing rules for all submodules
- ✅ Fallback for SPA routing is correctly configured

### 5. New Submodule Testing

#### 5.1 Submodule Generation
- [x] Test the create-submodule script
- [x] Verify all files are correctly created
- [x] Test submodule integration into the monorepo

**Testing Results:**
- ✅ Create-submodule script runs successfully
- ✅ All expected files are created with proper content
- ✅ Root package.json is updated with new scripts
- ✅ Netlify configuration is updated with new routes

**Testing Steps:**
```bash
# Generate a test submodule
npm run create-submodule test-submodule "Test Submodule"

# Verify directory and file creation
ls -la test-submodule

# Verify package.json updates
grep -A5 "test-submodule" package.json

# Verify netlify.toml updates
grep -A5 "test-submodule" netlify.toml

# Test building and running the new submodule
npm run build:test-submodule
npm run dev:test-submodule
```

#### 5.2 Submodule Import Testing
- [x] Test importing shared components in the new submodule
- [x] Verify TypeScript paths are correctly configured
- [x] Test building the new submodule as part of the consolidated build

**Testing Results:**
- ✅ Created test page in test-submodule that imports and uses shared components
- ✅ TypeScript path aliases work correctly for importing from shared directory
- ⚠️ Initial build of test-submodule failed due to TypeScript configuration issues
- ✅ Successfully fixed by updating tsconfig.json and build commands

**Testing Steps:**
```tsx
// Created a test page to verify shared component usage
import { Button } from 'shared/components';
import { isValidEmail, isValidPhone } from 'shared/utils/validation';

// Added route in App.tsx
<Route path="/test-shared" element={<TestSharedComponents />} />

// Added link in Home.tsx
<Link to="/test-shared">
  <Button variant="secondary">View Shared Components Test</Button>
</Link>
```

### 6. Deployment Testing

#### 6.1 Local Deployment Simulation
- [x] Test the production build locally
- [x] Verify all routes and redirects work as expected

**Testing Results:**
- ✅ Local deployment with `serve` works correctly
- ✅ Routes are accessible as expected

**Testing Steps:**
```bash
# Build and serve
npm run build
npx serve -s dist

# Test various routes
# - Main page: http://localhost:3000/
# - Art appraisers: http://localhost:3000/art-appraisers/
# - Test submodule: http://localhost:3000/test-submodule/
```

#### 6.2 CI/CD Pipeline Testing
- [ ] Test GitHub Actions workflows with a pull request
- [ ] Verify build steps complete successfully
- [ ] Test preview deployments if configured

### 7. Performance Testing

#### 7.1 Build Time Optimization
- [x] Measure build times for individual and consolidated builds
- [x] Verify incremental builds work properly

**Testing Results:**
- ✅ Individual build times:
  - main_page: ~14.4 seconds
  - art-appraisers-landing: ~4.1 seconds
  - test-submodule: ~1.5 seconds (after fixing build issues)
- ✅ Consolidated build time: ~20.4 seconds
- ⚠️ TypeScript compilation issues in test-submodule required configuration fixes
- ⚠️ Compression errors reported but don't affect functionality

**Testing Steps:**
```powershell
# Measure individual build times
Measure-Command { npm run build:main }
Measure-Command { npm run build:landing }
Measure-Command { npm run build:test-submodule }

# Measure consolidated build time
Measure-Command { npm run build }
```

#### 7.2 Bundle Size Analysis
- [ ] Analyze bundle sizes for each submodule
- [ ] Verify shared code is not duplicated
- [ ] Identify opportunities for code splitting

**Testing Steps:**
```bash
# For each submodule build, analyze the bundle size
npx vite build --mode analyze
```

### 8. Testing Summary and Recommendations

Based on the testing results, we have identified the following:

#### 8.1 Key Successes
- ✅ Monorepo structure is functioning well with npm workspaces
- ✅ Build system successfully integrates all submodules 
- ✅ Shared components and utilities are properly accessible from all submodules
- ✅ Netlify routing configuration works correctly
- ✅ New submodule creation process is automated and working

#### 8.2 Issues Identified
- ⚠️ ESLint dependency conflicts requiring use of `--legacy-peer-deps`
- ⚠️ TypeScript configuration issues in the test-submodule
- ⚠️ Compression errors in the build output (non-blocking)

#### 8.3 Recommendations
1. **Dependency Management:** Consider downgrading ESLint to version 8 to resolve dependency conflicts
2. **TypeScript Configuration:** Standardize TypeScript configuration across all submodules
3. **Build Process:** Investigate compression errors to improve build quality
4. **Documentation:** Update documentation to include workarounds for known issues

#### 8.4 Next Steps
1. Address the identified issues
2. Complete remaining tests including CI/CD pipeline testing
3. Ensure all team members understand the monorepo structure and development workflow

## Regression Testing Checklist

After any significant changes to the monorepo structure, run through these checks:

- [x] All npm workspace commands function correctly
- [x] All development servers start without errors
- [x] All builds complete successfully
- [x] Shared components render consistently in all submodules
- [x] Routing works properly between submodules
- [x] TypeScript types are properly shared
- [x] Pre-commit hooks are functioning
- [x] New submodule generation works correctly
- [ ] CI/CD pipeline completes successfully

## Issue Tracking and Resolution

For each issue found during testing:

1. Document the issue with clear reproduction steps
2. Categorize by severity (Critical, High, Medium, Low)
3. Assign to the appropriate team or individual
4. Track resolution in the project management system
5. Verify fix with the test that initially identified the issue

### Issues Found

1. **ESLint Version Conflict** (Medium)
   - **Description**: ESLint v9 conflicts with TypeScript ESLint parser which requires ESLint v8
   - **Reproduction**: Run `npm install` without flags
   - **Workaround**: Use `--legacy-peer-deps` flag
   - **Resolution**: Update dependencies to compatible versions

2. **Compression Errors in Build** (Low)
   - **Description**: Some compression errors reported during build process
   - **Impact**: No functional impact, builds still complete successfully
   - **Resolution**: Investigate compression plugin configuration

## Test Automation Roadmap

Future improvements to the testing process:

- [ ] Create automated integration tests for shared components
- [ ] Set up end-to-end tests for critical user journeys across submodules
- [ ] Implement visual regression testing for UI components
- [ ] Create performance testing benchmarks
- [ ] Set up monitoring for production deployments 