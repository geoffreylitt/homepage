#!/usr/bin/env node

/**
 * Middleman vs Generated Astro Site Verification
 * 
 * Compares built HTML files from Middleman and generated Astro sites with 
 * detailed similarity analysis using Levenshtein distance and line-by-line comparison.
 * 
 * Usage:
 *   node verify-against-middleman.js                    # Summary with similarity scores
 *   node verify-against-middleman.js --file /blog      # Compare specific file with stats
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
 * Calculate Levenshtein distance between two strings (memory-optimized for large files)
 */
function levenshteinDistance(str1, str2) {
  // For very large files, truncate to avoid memory issues
  const maxLength = 10000;
  if (str1.length > maxLength) str1 = str1.substring(0, maxLength);
  if (str2.length > maxLength) str2 = str2.substring(0, maxLength);
  
  // Use two rows instead of full matrix to save memory
  let prev = Array(str1.length + 1).fill(0);
  let curr = Array(str1.length + 1).fill(0);
  
  // Initialize first row
  for (let i = 0; i <= str1.length; i++) {
    prev[i] = i;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    curr[0] = j;
    
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1] + 1,     // deletion
        prev[i] + 1,         // insertion
        prev[i - 1] + cost   // substitution
      );
    }
    
    // Swap rows
    [prev, curr] = [curr, prev];
  }
  
  return prev[str1.length];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(str1, str2);
  return Math.max(0, ((maxLength - distance) / maxLength) * 100);
}

/**
 * Get line-by-line diff statistics
 */
function getLineDiffStats(str1, str2) {
  const lines1 = str1.split('\n');
  const lines2 = str2.split('\n');
  
  let identical = 0;
  let different = 0;
  let added = 0;
  let removed = 0;
  
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined) {
      added++;
    } else if (line2 === undefined) {
      removed++;
    } else if (line1 === line2) {
      identical++;
    } else {
      different++;
    }
  }
  
  return {
    totalLines: maxLines,
    identical,
    different,
    added,
    removed,
    identicalPercent: maxLines > 0 ? (identical / maxLines) * 100 : 100
  };
}

/**
 * Compare two files and return comparison result
 */
function compareFiles(middlemanPath, astroPath) {
  const middlemanExists = fs.existsSync(middlemanPath);
  const astroExists = fs.existsSync(astroPath);
  
  if (!middlemanExists && !astroExists) {
    return { status: 'both_missing', identical: true, similarity: 100 };
  }
  
  if (!middlemanExists) {
    return { status: 'middleman_missing', identical: false, similarity: 0 };
  }
  
  if (!astroExists) {
    return { status: 'astro_missing', identical: false, similarity: 0 };
  }
  
  const middlemanContent = fs.readFileSync(middlemanPath, 'utf8');
  const astroContent = fs.readFileSync(astroPath, 'utf8');
  
  const identical = middlemanContent === astroContent;
  const similarity = calculateSimilarity(middlemanContent, astroContent);
  const lineDiffStats = getLineDiffStats(middlemanContent, astroContent);
  
  return {
    status: 'both_exist',
    identical,
    similarity: Math.round(similarity * 10) / 10, // Round to 1 decimal
    middlemanSize: middlemanContent.length,
    astroSize: astroContent.length,
    sizeDiff: astroContent.length - middlemanContent.length,
    lineDiffStats
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
        console.log(`❌ Files differ (${result.similarity}% similar)`);
        if (result.status === 'both_exist') {
          console.log(`  Size: ${result.middlemanSize} → ${result.astroSize} bytes (${result.sizeDiff > 0 ? '+' : ''}${result.sizeDiff})`);
          console.log(`  Character similarity: ${result.similarity}%`);
          
          const stats = result.lineDiffStats;
          console.log(`  Line analysis:`);
          console.log(`    Total lines: ${stats.totalLines}`);
          console.log(`    Identical: ${stats.identical} (${Math.round(stats.identicalPercent * 10) / 10}%)`);
          console.log(`    Different: ${stats.different}`);
          if (stats.added > 0) console.log(`    Added: ${stats.added}`);
          if (stats.removed > 0) console.log(`    Removed: ${stats.removed}`);
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
    let totalSimilarity = 0;
    
    for (const filePath of KEY_FILES) {
      const middlemanPath = path.join(MIDDLEMAN_BUILD, filePath);
      const astroPath = path.join(ASTRO_DIST, filePath);
      const result = compareFiles(middlemanPath, astroPath);
      
      totalFiles++;
      totalSimilarity += result.similarity || 0;
      
      if (result.identical) {
        identicalFiles++;
        console.log(`✅ ${filePath} (100% similar)`);
      } else {
        const similarityStr = result.similarity !== undefined ? ` (${result.similarity}% similar)` : '';
        console.log(`❌ ${filePath}${similarityStr}`);
        differences.push({ file: filePath, result });
        
        if (result.status === 'both_exist') {
          console.log(`   Size: ${result.middlemanSize} → ${result.astroSize} bytes (${result.sizeDiff > 0 ? '+' : ''}${result.sizeDiff})`);
          if (result.lineDiffStats) {
            const linePercent = Math.round(result.lineDiffStats.identicalPercent * 10) / 10;
            console.log(`   Lines: ${result.lineDiffStats.identical}/${result.lineDiffStats.totalLines} identical (${linePercent}%)`);
          }
        } else {
          console.log(`   Status: ${result.status}`);
        }
      }
    }
    
    const avgSimilarity = totalFiles > 0 ? (totalSimilarity / totalFiles).toFixed(1) : 0;
    console.log(`\n📈 Results: ${identicalFiles}/${totalFiles} files identical (${((identicalFiles/totalFiles) * 100).toFixed(1)}%)`);
    console.log(`📊 Average similarity: ${avgSimilarity}%`);
    
    if (differences.length > 0) {
      console.log('\n🔍 To investigate differences:');
      differences.forEach(({ file, result }) => {
        const urlPath = file === 'index.html' ? '/' : '/' + file.replace('/index.html', '/').replace('.html', '');
        const priority = result.similarity < 50 ? '🔴' : result.similarity < 80 ? '🟡' : '🟢';
        console.log(`  ${priority} node verify-against-middleman.js --file ${urlPath}`);
        console.log(`     node verify-against-middleman.js --diff ${urlPath}`);
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