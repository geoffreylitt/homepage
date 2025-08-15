#!/usr/bin/env node

/**
 * Middleman vs Generated Astro Site Verification
 * 
 * Compares built HTML files from Middleman and generated Astro sites.
 * 
 * Usage:
 *   node verify-against-middleman.js                    # Summary comparison
 *   node verify-against-middleman.js --file /blog      # Compare specific file
 *   node verify-against-middleman.js --diff /blog      # Show detailed diff for file
 *   node verify-against-middleman.js --list            # List all comparable files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MIDDLEMAN_BUILD = 'build';
const ASTRO_GENERATED = 'astro-port-generated';
const ASTRO_DIST = path.join(ASTRO_GENERATED, 'dist');

// Key files to compare
const KEY_FILES = [
  'index.html',
  'blog.html', 
  'inspirations.html',
  'wildcard/index.html',
  '2023/03/25/llm-end-user-programming.html',
  'projects/wildcard.html',
  'feed.xml'
];

/**
 * Execute command and return output
 */
function execCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Get all HTML/XML files from a directory
 */
function getComparableFiles(dir) {
  const files = [];
  
  function walkDir(currentDir, relativePath = '') {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const relPath = path.join(relativePath, entry);
      
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath, relPath);
      } else if (entry.endsWith('.html') || entry.endsWith('.xml')) {
        files.push(relPath.replace(/\\/g, '/'));
      }
    }
  }
  
  walkDir(dir);
  return files.sort();
}

/**
 * Compare two files and return comparison result
 */
function compareFiles(middlemanPath, astroPath) {
  const middlemanExists = fs.existsSync(middlemanPath);
  const astroExists = fs.existsSync(astroPath);
  
  if (!middlemanExists && !astroExists) {
    return { status: 'both_missing', identical: true };
  }
  
  if (!middlemanExists) {
    return { status: 'middleman_missing', identical: false };
  }
  
  if (!astroExists) {
    return { status: 'astro_missing', identical: false };
  }
  
  const middlemanContent = fs.readFileSync(middlemanPath, 'utf8');
  const astroContent = fs.readFileSync(astroPath, 'utf8');
  
  const identical = middlemanContent === astroContent;
  
  return {
    status: 'both_exist',
    identical,
    middlemanSize: middlemanContent.length,
    astroSize: astroContent.length,
    sizeDiff: astroContent.length - middlemanContent.length
  };
}

/**
 * Show detailed diff between two files
 */
function showDetailedDiff(middlemanPath, astroPath) {
  if (!fs.existsSync(middlemanPath)) {
    console.log(`❌ Middleman file not found: ${middlemanPath}`);
    return;
  }
  
  if (!fs.existsSync(astroPath)) {
    console.log(`❌ Astro file not found: ${astroPath}`);
    return;
  }
  
  try {
    const diff = execCommand(`diff -u "${middlemanPath}" "${astroPath}"`);
    console.log(diff);
  } catch (error) {
    // diff returns non-zero when files differ, which is expected
    console.log(error.stdout || 'Files differ but diff output unavailable');
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    return { mode: 'list' };
  }
  
  const fileIndex = args.indexOf('--file');
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    return { mode: 'file', path: args[fileIndex + 1] };
  }
  
  const diffIndex = args.indexOf('--diff');
  if (diffIndex !== -1 && args[diffIndex + 1]) {
    return { mode: 'diff', path: args[diffIndex + 1] };
  }
  
  return { mode: 'summary' };
}

/**
 * Convert URL path to file path
 */
function urlToFilePath(urlPath) {
  if (urlPath === '/') return 'index.html';
  if (urlPath.endsWith('/')) return urlPath.slice(1) + 'index.html';
  if (urlPath.startsWith('/')) return urlPath.slice(1);
  return urlPath;
}

/**
 * Main verification function
 */
async function main() {
  const options = parseArgs();
  
  console.log('🔍 Middleman vs Astro Build Verification');
  console.log('=========================================\n');

  try {
    // Step 1: Generate Astro site if needed
    if (!fs.existsSync(ASTRO_GENERATED)) {
      console.log('📄 Generating Astro site...');
      execCommand('node astro-port-generator/generate.js');
      execCommand('npm install', { cwd: ASTRO_GENERATED });
    }

    // Step 2: Build both sites
    console.log('📦 Building sites...');
    
    // Build Middleman
    if (!fs.existsSync(MIDDLEMAN_BUILD)) {
      console.log('  Building Middleman site...');
      execCommand('bundle exec middleman build');
    }
    
    // Build Astro
    console.log('  Building Astro site...');
    execCommand('npm run build', { cwd: ASTRO_GENERATED });
    
    console.log('✅ Both sites built\n');

    // Handle different modes
    if (options.mode === 'list') {
      console.log('📋 Comparable files:');
      const middlemanFiles = getComparableFiles(MIDDLEMAN_BUILD);
      const astroFiles = getComparableFiles(ASTRO_DIST);
      const allFiles = [...new Set([...middlemanFiles, ...astroFiles])];
      
      allFiles.forEach(file => {
        const inMiddleman = middlemanFiles.includes(file);
        const inAstro = astroFiles.includes(file);
        const status = inMiddleman && inAstro ? '✅' : 
                      inMiddleman ? '🔴 M' : '🔴 A';
        console.log(`  ${status} ${file}`);
      });
      return;
    }
    
    if (options.mode === 'file' || options.mode === 'diff') {
      const filePath = urlToFilePath(options.path);
      const middlemanPath = path.join(MIDDLEMAN_BUILD, filePath);
      const astroPath = path.join(ASTRO_DIST, filePath);
      
      if (options.mode === 'diff') {
        console.log(`📄 Detailed diff for ${filePath}:\n`);
        showDetailedDiff(middlemanPath, astroPath);
        return;
      }
      
      console.log(`📄 Comparing ${filePath}:\n`);
      const result = compareFiles(middlemanPath, astroPath);
      
      if (result.identical) {
        console.log('✅ Files are identical');
      } else {
        console.log('❌ Files differ');
        if (result.status === 'both_exist') {
          console.log(`  Middleman: ${result.middlemanSize} bytes`);
          console.log(`  Astro: ${result.astroSize} bytes`);
          console.log(`  Difference: ${result.sizeDiff > 0 ? '+' : ''}${result.sizeDiff} bytes`);
        } else {
          console.log(`  Status: ${result.status}`);
        }
        console.log(`\nFor detailed diff, run:`);
        console.log(`  node verify-against-middleman.js --diff ${options.path}`);
      }
      return;
    }

    // Summary mode
    console.log('📊 Summary comparison:\n');
    
    let totalFiles = 0;
    let identicalFiles = 0;
    let differences = [];
    
    for (const filePath of KEY_FILES) {
      const middlemanPath = path.join(MIDDLEMAN_BUILD, filePath);
      const astroPath = path.join(ASTRO_DIST, filePath);
      const result = compareFiles(middlemanPath, astroPath);
      
      totalFiles++;
      
      if (result.identical) {
        identicalFiles++;
        console.log(`✅ ${filePath}`);
      } else {
        console.log(`❌ ${filePath}`);
        differences.push(filePath);
        
        if (result.status === 'both_exist') {
          console.log(`   Size: ${result.middlemanSize} → ${result.astroSize} bytes (${result.sizeDiff > 0 ? '+' : ''}${result.sizeDiff})`);
        } else {
          console.log(`   Status: ${result.status}`);
        }
      }
    }
    
    console.log(`\n📈 Results: ${identicalFiles}/${totalFiles} files identical (${((identicalFiles/totalFiles) * 100).toFixed(1)}%)`);
    
    if (differences.length > 0) {
      console.log('\n🔍 To investigate differences:');
      differences.forEach(file => {
        const urlPath = file === 'index.html' ? '/' : '/' + file.replace('/index.html', '/').replace('.html', '');
        console.log(`  node verify-against-middleman.js --file ${urlPath}`);
        console.log(`  node verify-against-middleman.js --diff ${urlPath}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };