#!/usr/bin/env node

/**
 * Script to create a new submodule from the template
 * 
 * Usage:
 * node scripts/create-submodule.js my-new-submodule "My New Submodule"
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Get arguments
const submoduleName = process.argv[2];
const displayName = process.argv[3] || submoduleName;

if (!submoduleName) {
  console.error(chalk.red('Error: Please provide a submodule name'));
  console.log('Usage: node scripts/create-submodule.js my-new-submodule "My New Submodule"');
  process.exit(1);
}

// Define paths
const templateDir = path.resolve(__dirname, '../templates/submodule');
const targetDir = path.resolve(__dirname, '..', submoduleName);

// Check if directory already exists
if (fs.existsSync(targetDir)) {
  console.error(chalk.red(`Error: Directory ${submoduleName} already exists`));
  process.exit(1);
}

// Create submodule directory
console.log(chalk.blue(`Creating new submodule: ${displayName} (${submoduleName})`));
fs.mkdirSync(targetDir);

// Copy template files
console.log(chalk.yellow('Copying template files...'));
fs.copySync(templateDir, targetDir);

// Create source directory structure
const srcDir = path.join(targetDir, 'src');
fs.mkdirSync(srcDir);
fs.mkdirSync(path.join(srcDir, 'components'));
fs.mkdirSync(path.join(srcDir, 'pages'));
fs.mkdirSync(path.join(srcDir, 'hooks'));
fs.mkdirSync(path.join(srcDir, 'utils'));
fs.mkdirSync(path.join(srcDir, 'assets'));
fs.mkdirSync(path.join(srcDir, 'styles'));

// Create basic files
console.log(chalk.yellow('Creating source files...'));

// Create main.tsx
fs.writeFileSync(
  path.join(srcDir, 'main.tsx'),
  `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Initialize theme
import { initializeTheme } from 'shared/utils';
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
`
);

// Create App.tsx
fs.writeFileSync(
  path.join(srcDir, 'App.tsx'),
  `import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './styles/App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
`
);

// Create Home page
fs.writeFileSync(
  path.join(srcDir, 'pages', 'Home.tsx'),
  `import { Button } from 'shared/components';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">${displayName}</h1>
      <p className="text-lg mb-8">Welcome to the ${displayName} submodule!</p>
      <Button variant="primary">Get Started</Button>
    </div>
  );
}
`
);

// Create index.css
fs.writeFileSync(
  path.join(srcDir, 'styles', 'index.css'),
  `@import '../../../shared/styles/theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
`
);

// Create App.css
fs.writeFileSync(
  path.join(srcDir, 'styles', 'App.css'),
  `/* Application specific styles */
`
);

// Update package.json
console.log(chalk.yellow('Updating package.json...'));
const packageJsonPath = path.join(targetDir, 'package.json');
const packageJson = require(packageJsonPath);
packageJson.name = submoduleName;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update README.md
console.log(chalk.yellow('Updating README.md...'));
let readmeContent = fs.readFileSync(path.join(targetDir, 'README.md'), 'utf8');
readmeContent = readmeContent.replace(/Submodule Name/g, displayName);
readmeContent = readmeContent.replace(/submodule-name/g, submoduleName);
fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);

// Update index.html
console.log(chalk.yellow('Updating index.html...'));
let indexHtmlContent = fs.readFileSync(path.join(targetDir, 'index.html'), 'utf8');
indexHtmlContent = indexHtmlContent.replace(/\[Submodule Name\]/g, displayName);
fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtmlContent);

// Update root package.json to include the new submodule in workspaces
console.log(chalk.yellow('Updating root package.json...'));
const rootPackageJsonPath = path.resolve(__dirname, '../package.json');
const rootPackageJson = require(rootPackageJsonPath);

// Add scripts for the new submodule
rootPackageJson.scripts[`dev:${submoduleName}`] = `npm run dev --workspace=${submoduleName}`;
rootPackageJson.scripts[`build:${submoduleName}`] = `npm run build --workspace=${submoduleName}`;

fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

// Update Netlify configuration to include the new submodule
console.log(chalk.yellow('Updating Netlify configuration...'));
const netlifyTomlPath = path.resolve(__dirname, '../netlify.toml');
let netlifyTomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');

// Add appropriate redirects for the new submodule
// This is a simplified approach - may need manual adjustment for complex routing
const redirectsSection = `
# ${displayName} Routes
[[redirects]]
  from = "/${submoduleName}/*"
  to = "/${submoduleName}/dist/index.html"
  status = 200

# ${displayName} Assets
[[redirects]]
  from = "/${submoduleName}/assets/*"
  to = "/${submoduleName}/dist/assets/:splat"
  status = 200
`;

// Insert redirects before the fallback redirect
netlifyTomlContent = netlifyTomlContent.replace(
  /# Handle fallback for client-side routing/,
  `${redirectsSection}\n# Handle fallback for client-side routing`
);

fs.writeFileSync(netlifyTomlPath, netlifyTomlContent);

// Update build script to include the new submodule
console.log(chalk.yellow('Updating build script...'));
const buildScriptPath = path.resolve(__dirname, './build.js');
let buildScriptContent = fs.readFileSync(buildScriptPath, 'utf8');

// Add the new submodule to the submodules array
buildScriptContent = buildScriptContent.replace(
  /const submodules = \[(.*?)\];/s,
  `const submodules = [$1, '${submoduleName}'];`
);

fs.writeFileSync(buildScriptPath, buildScriptContent);

console.log(chalk.green(`\n✅ Successfully created new submodule: ${displayName} (${submoduleName})`));
console.log(chalk.blue('\nNext steps:'));
console.log(`1. cd ${submoduleName}`);
console.log('2. npm install');
console.log(`3. npm run dev (or npm run dev:${submoduleName} from root)`);

// Exit with success code
process.exit(0); 