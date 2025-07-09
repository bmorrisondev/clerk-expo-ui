#!/usr/bin/env node

/**
 * Install script for clerk-expo-ui
 * This script copies UI components to the user's project and checks for missing peer dependencies
 * If components already exist, it prompts the user for confirmation before replacing them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = 'components/clerk'; // Default target directory

// Check if user provided a custom target directory
if (args.length > 0) {
  targetDir = args[0];
}

// Ensure target directory doesn't have leading slash when specified by user
if (targetDir.startsWith('/')) {
  targetDir = targetDir.substring(1);
}

// Get the current working directory (user's project directory)
const userProjectDir = process.cwd();
const targetPath = path.join(userProjectDir, targetDir);

// Get the source directory (our package's src directory)
const sourcePath = path.join(__dirname, '..', 'src');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true });
  console.log(`📁 Created directory: ${targetDir}`);
}

// Helper function to recursively check if files exist in target directory
function checkExistingFiles(source, destination, relativePath = '') {
  if (!fs.existsSync(destination)) return false;
  
  const files = fs.readdirSync(source);
  const existingFiles = [];
  
  files.forEach(file => {
    if (file === 'index.ts') return; // Skip the index.ts file
    
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    const relativeFilePath = relativePath ? path.join(relativePath, file) : file;
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      } else {
        // Check files in subdirectory
        const subDirFiles = checkExistingFiles(sourcePath, destPath, relativeFilePath);
        if (subDirFiles) {
          existingFiles.push(...subDirFiles);
        }
      }
    }
    // Check if file already exists
    else if (fs.existsSync(destPath) && fs.statSync(sourcePath).isFile()) {
      existingFiles.push(relativeFilePath);
    }
  });
  
  return existingFiles.length > 0 ? existingFiles : false;
}

// Helper function to prompt user for confirmation
async function promptForConfirmation(existingFiles, targetDir) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(`\n⚠️ The following files already exist in ${targetDir}:`);
    existingFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\nThese files will be replaced with the new components.');
    
    rl.question('Enter Y to continue or any other key to cancel: ', (answer) => {
      rl.close();
      resolve(answer.trim().toUpperCase() === 'Y');
    });
  });
}

// Helper function to recursively copy files
function copyFiles(source, destination, relativePath = '') {
  // Read all files from source directory
  const files = fs.readdirSync(source);
  
  // Copy each file except index.ts
  let copiedCount = 0;
  
  files.forEach(file => {
    if (file === 'index.ts') return; // Skip the index.ts file
    
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    const relativeFilePath = relativePath ? path.join(relativePath, file) : file;
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        console.log(`📁 Created directory: ${path.relative(userProjectDir, destPath)}`);
      }
      
      // Recursively copy files from subdirectory
      copiedCount += copyFiles(sourcePath, destPath, relativeFilePath);
    }
    // Copy if it's a file
    else if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`📄 Copied: ${relativeFilePath} to ${path.relative(userProjectDir, destPath)}`);
      copiedCount++;
    }
  });
  
  return copiedCount;
}

// Function to check for missing peer dependencies
function checkPeerDependencies() {
  // Get our package.json to check peer dependencies
  const ourPackageJsonPath = path.join(__dirname, '..', 'package.json');
  const ourPackageJson = JSON.parse(fs.readFileSync(ourPackageJsonPath, 'utf8'));
  
  // Get user's package.json
  const userPackageJsonPath = path.join(userProjectDir, 'package.json');
  
  if (!fs.existsSync(userPackageJsonPath)) {
    console.log('\n⚠️ Could not find package.json in your project. Skipping dependency check.');
    return;
  }
  
  const userPackageJson = JSON.parse(fs.readFileSync(userPackageJsonPath, 'utf8'));
  
  // Check for missing peer dependencies
  const peerDeps = ourPackageJson.peerDependencies || {};
  const userDeps = {
    ...userPackageJson.dependencies || {},
    ...userPackageJson.devDependencies || {}
  };
  
  const missingDeps = {};
  
  for (const [dep, version] of Object.entries(peerDeps)) {
    if (!userDeps[dep]) {
      missingDeps[dep] = version;
    }
  }
  
  // If there are missing dependencies, suggest installation
  if (Object.keys(missingDeps).length > 0) {
    console.log('\n⚠️ The following peer dependencies are required but not installed:');
    
    for (const [dep, version] of Object.entries(missingDeps)) {
      console.log(`  - ${dep}@${version}`);
    }
    
    // Detect package manager
    let packageManager = 'npm';
    
    if (fs.existsSync(path.join(userProjectDir, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(userProjectDir, 'yarn.lock'))) {
      packageManager = 'yarn';
    }
    
    // Build installation command
    const depsString = Object.entries(missingDeps)
      .map(([dep, version]) => `${dep}@${version}`)
      .join(' ');
    
    let installCmd = '';
    
    if (packageManager === 'npm') {
      installCmd = `npm install ${depsString}`;
    } else if (packageManager === 'yarn') {
      installCmd = `yarn add ${depsString}`;
    } else if (packageManager === 'pnpm') {
      installCmd = `pnpm add ${depsString}`;
    }
    
    console.log(`\n📦 Please install the missing dependencies by running:\n\n  ${installCmd}\n`);
  }
}

// Main installation function
async function installComponents() {
  try {
    // Check if files already exist
    const existingFiles = checkExistingFiles(sourcePath, targetPath);
    
    // If files exist, prompt for confirmation
    if (existingFiles) {
      const shouldContinue = await promptForConfirmation(existingFiles, targetDir);
      
      if (!shouldContinue) {
        console.log('\n❌ Installation cancelled by user.');
        process.exit(0);
      }
    }
    
    // Copy the files
    const copiedCount = copyFiles(sourcePath, targetPath);
    
    if (copiedCount > 0) {
      console.log(`\n✅ Successfully installed ${copiedCount} Clerk UI components to ${targetDir}/`);
      console.log('\n🚀 You can now import these components directly in your project:');
      console.log(`\nimport { SignIn } from './${targetDir}/SignIn';`);
      
      // Check for missing peer dependencies
      checkPeerDependencies();
      
      console.log('\n📚 For more information, visit: https://github.com/your-username/clerk-expo-ui');
    } else {
      console.log('⚠️ No files were copied. The source directory might be empty.');
    }
  } catch (error) {
    console.error('❌ Installation failed:', error);
    process.exit(1);
  }
}

// Run the installation
installComponents();
