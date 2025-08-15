#!/usr/bin/env node

/**
 * Astro Port Verification Script
 * 
 * This script compares the generated Astro port (astro-port-generated/) 
 * with the existing manually created port (astro-port/) to verify
 * how closely our generation script matches the original work.
 * 
 * The goal is to create a feedback loop for improving the generation
 * script until it produces output that matches the manual port as
 * closely as possible.
 * 
 * Usage: node verify-port.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const GENERATED_DIR = 'astro-port-generated';
const EXISTING_DIR = 'astro-port';

/**
 * Recursively get all files in a directory with their relative paths
 */
function getAllFiles(dir, basePath = '') {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    // Skip node_modules, .git, dist, and other build directories
    if (['node_modules', '.git', 'dist', '.astro'].includes(item)) {
      continue;
    }
    
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  
  return files.sort();
}

/**
 * Categorize files by type for easier analysis
 */
function categorizeFiles(files) {
  const categories = {
    config: [],
    pages: [],
    components: [],
    content: [],
    styles: [],
    public: [],
    data: [],
    layouts: [],
    other: []
  };
  
  files.forEach(file => {
    const normalized = file.toLowerCase();
    
    if (normalized.includes('config') || normalized.includes('package.json') || normalized.includes('tsconfig')) {
      categories.config.push(file);
    } else if (normalized.includes('src/pages/')) {
      categories.pages.push(file);
    } else if (normalized.includes('src/components/')) {
      categories.components.push(file);
    } else if (normalized.includes('src/content/')) {
      categories.content.push(file);
    } else if (normalized.includes('src/styles/') || normalized.includes('.scss') || normalized.includes('.css')) {
      categories.styles.push(file);
    } else if (normalized.includes('public/')) {
      categories.public.push(file);
    } else if (normalized.includes('src/data/')) {
      categories.data.push(file);
    } else if (normalized.includes('src/layouts/')) {
      categories.layouts.push(file);
    } else {
      categories.other.push(file);
    }
  });
  
  return categories;
}

/**
 * Compare file contents for files that exist in both directories
 */
function compareFileContents(file) {
  const generatedPath = path.join(GENERATED_DIR, file);
  const existingPath = path.join(EXISTING_DIR, file);
  
  if (!fs.existsSync(generatedPath) || !fs.existsSync(existingPath)) {
    return { identical: false, reason: 'File missing in one location' };
  }
  
  try {
    const generatedContent = fs.readFileSync(generatedPath, 'utf8');
    const existingContent = fs.readFileSync(existingPath, 'utf8');
    
    if (generatedContent === existingContent) {
      return { identical: true };
    } else {
      // Calculate rough difference size
      const sizeDiff = Math.abs(generatedContent.length - existingContent.length);
      return { 
        identical: false, 
        reason: 'Content differs',
        sizeDiff: sizeDiff,
        generatedSize: generatedContent.length,
        existingSize: existingContent.length
      };
    }
  } catch (error) {
    return { identical: false, reason: `Error reading files: ${error.message}` };
  }
}

/**
 * Generate a detailed comparison report
 */
function generateReport() {
  console.log('🔍 Astro Port Verification Report');
  console.log('=====================================');
  console.log('');
  
  // Get file lists
  const generatedFiles = getAllFiles(GENERATED_DIR);
  const existingFiles = getAllFiles(EXISTING_DIR);
  
  console.log(`📊 File Count Summary:`);
  console.log(`  Generated: ${generatedFiles.length} files`);
  console.log(`  Existing:  ${existingFiles.length} files`);
  console.log('');
  
  // Find common and unique files
  const generatedSet = new Set(generatedFiles);
  const existingSet = new Set(existingFiles);
  
  const commonFiles = [...generatedSet].filter(f => existingSet.has(f));
  const onlyInGenerated = [...generatedSet].filter(f => !existingSet.has(f));
  const onlyInExisting = [...existingSet].filter(f => !generatedSet.has(f));
  
  console.log(`📋 File Overlap Analysis:`);
  console.log(`  Common files:        ${commonFiles.length}`);
  console.log(`  Only in generated:   ${onlyInGenerated.length}`);
  console.log(`  Only in existing:    ${onlyInExisting.length}`);
  console.log('');
  
  // Categorize missing files to understand what's not implemented yet
  const missingCategories = categorizeFiles(onlyInExisting);
  
  console.log(`❌ Missing from Generated (${onlyInExisting.length} files):`);
  Object.entries(missingCategories).forEach(([category, files]) => {
    if (files.length > 0) {
      console.log(`  ${category}: ${files.length} files`);
      // Show first few files as examples
      files.slice(0, 3).forEach(file => console.log(`    - ${file}`));
      if (files.length > 3) {
        console.log(`    ... and ${files.length - 3} more`);
      }
    }
  });
  console.log('');
  
  // Compare content of common files
  const contentComparisons = commonFiles.map(file => ({
    file,
    ...compareFileContents(file)
  }));
  
  const identicalFiles = contentComparisons.filter(c => c.identical);
  const differentFiles = contentComparisons.filter(c => !c.identical);
  
  console.log(`📝 Content Comparison (${commonFiles.length} common files):`);
  console.log(`  Identical content:   ${identicalFiles.length} files`);
  console.log(`  Different content:   ${differentFiles.length} files`);
  console.log('');
  
  if (differentFiles.length > 0) {
    console.log(`🔍 Files with Different Content:`);
    differentFiles.slice(0, 10).forEach(diff => {
      console.log(`  ${diff.file}: ${diff.reason}`);
      if (diff.sizeDiff) {
        console.log(`    Size diff: ${diff.sizeDiff} chars (gen: ${diff.generatedSize}, exist: ${diff.existingSize})`);
      }
    });
    if (differentFiles.length > 10) {
      console.log(`  ... and ${differentFiles.length - 10} more files with differences`);
    }
    console.log('');
  }
  
  // Calculate completion percentage
  const completionPercentage = Math.round((commonFiles.length / existingFiles.length) * 100);
  const matchPercentage = Math.round((identicalFiles.length / existingFiles.length) * 100);
  
  console.log(`📈 Progress Summary:`);
  console.log(`  File coverage:    ${completionPercentage}% (${commonFiles.length}/${existingFiles.length})`);
  console.log(`  Content accuracy: ${matchPercentage}% (${identicalFiles.length}/${existingFiles.length})`);
  console.log('');
  
  // Recommendations
  console.log(`💡 Next Steps:`);
  if (onlyInExisting.length > 0) {
    const topMissingCategory = Object.entries(missingCategories)
      .sort(([,a], [,b]) => b.length - a.length)[0];
    console.log(`  1. Focus on implementing ${topMissingCategory[0]} files (${topMissingCategory[1].length} missing)`);
  }
  if (differentFiles.length > 0) {
    console.log(`  2. Review content differences in common files`);
  }
  if (completionPercentage < 100) {
    console.log(`  3. Current generation script is ${completionPercentage}% complete`);
  } else {
    console.log(`  3. 🎉 All files present! Focus on content accuracy.`);
  }
}

/**
 * Main execution function
 */
function main() {
  try {
    // Verify that required directories exist
    if (!fs.existsSync(GENERATED_DIR)) {
      throw new Error(`Generated directory "${GENERATED_DIR}" not found. Please run generate-astro-port.js first.`);
    }
    
    if (!fs.existsSync(EXISTING_DIR)) {
      throw new Error(`Existing directory "${EXISTING_DIR}" not found.`);
    }

    generateReport();

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  getAllFiles,
  categorizeFiles,
  compareFileContents,
  generateReport,
  main
};