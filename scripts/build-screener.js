const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Directory where the screener module is located
const screenerDir = path.resolve(__dirname, '../screener-page-module');

console.log('Building screener module without TypeScript checking...');

try {
  // Create a temporary tsconfig.json to bypass type checking
  const tsconfigPath = path.join(screenerDir, 'tsconfig.json');
  const tsconfigBackupPath = path.join(screenerDir, 'tsconfig.json.bak');
  
  // Backup original tsconfig if it exists
  if (fs.existsSync(tsconfigPath)) {
    fs.copyFileSync(tsconfigPath, tsconfigBackupPath);
    
    // Create simplified tsconfig that skips type checking
    const tsconfig = {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "esModuleInterop": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "allowJs": true,
        "noEmitOnError": false
      },
      "include": ["src"]
    };
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }

  // Create a dist directory if it doesn't exist
  const distDir = path.join(screenerDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Use Vite to build without running tsc first
  execSync('npx vite build', {
    cwd: screenerDir,
    stdio: 'inherit'
  });

  // Restore original tsconfig
  if (fs.existsSync(tsconfigBackupPath)) {
    fs.copyFileSync(tsconfigBackupPath, tsconfigPath);
    fs.unlinkSync(tsconfigBackupPath);
  }

  console.log('Screener module built successfully');
} catch (error) {
  // Restore original tsconfig in case of error
  const tsconfigPath = path.join(screenerDir, 'tsconfig.json');
  const tsconfigBackupPath = path.join(screenerDir, 'tsconfig.json.bak');
  
  if (fs.existsSync(tsconfigBackupPath)) {
    fs.copyFileSync(tsconfigBackupPath, tsconfigPath);
    fs.unlinkSync(tsconfigBackupPath);
  }
  
  console.error('Error building screener module:', error);
  process.exit(1);
} 