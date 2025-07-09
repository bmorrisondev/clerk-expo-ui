#!/usr/bin/env node

/**
 * Build script for clerk-expo-ui
 * This script handles the TypeScript compilation process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🔨 Building clerk-expo-ui...');

try {
  // Run TypeScript compiler
  execSync('tsc', { stdio: 'inherit' });
  
  // Copy package.json to dist folder (with modifications if needed)
  const packageJson = require('../package.json');
  
  // Remove development-only fields
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  
  // Update bin path for the published package
  if (packageJson.bin && packageJson.bin['clerk-expo-ui']) {
    packageJson.bin['clerk-expo-ui'] = './scripts/install.js';
  }
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Copy README.md to dist folder
  fs.copyFileSync(
    path.join(__dirname, '..', 'README.md'),
    path.join(distDir, 'README.md')
  );

  // Ensure scripts directory exists in dist
  const distScriptsDir = path.join(distDir, 'scripts');
  if (!fs.existsSync(distScriptsDir)) {
    fs.mkdirSync(distScriptsDir, { recursive: true });
  }

  // Copy install.js to dist/scripts folder
  fs.copyFileSync(
    path.join(__dirname, 'install.js'),
    path.join(distScriptsDir, 'install.js')
  );
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
