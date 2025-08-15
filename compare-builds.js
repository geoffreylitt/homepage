#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MIDDLEMAN_BUILD = path.join(__dirname, 'build');
const ASTRO_BUILD = path.join(__dirname, 'astro-port', 'dist');

function getAllFiles(dir, fileList = [], baseDir = dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList, baseDir);
    } else {
      const relativePath = path.relative(baseDir, filePath);
      fileList.push(relativePath);
    }
  });
  
  return fileList;
}

function compareBuilds() {
  console.log('🔍 Comparing build directories...\n');
  console.log(`Middleman build: ${MIDDLEMAN_BUILD}`);
  console.log(`Astro build:     ${ASTRO_BUILD}\n`);
  
  // Get all files from both directories
  const middlemanFiles = new Set(getAllFiles(MIDDLEMAN_BUILD));
  const astroFiles = new Set(getAllFiles(ASTRO_BUILD));
  
  // Files only in Middleman
  const onlyInMiddleman = [...middlemanFiles].filter(f => !astroFiles.has(f));
  
  // Files only in Astro
  const onlyInAstro = [...astroFiles].filter(f => !middlemanFiles.has(f));
  
  // Files in both - check for content differences
  const inBoth = [...middlemanFiles].filter(f => astroFiles.has(f));
  
  // Summary stats
  console.log('📊 Summary:');
  console.log(`  Middleman files: ${middlemanFiles.size}`);
  console.log(`  Astro files:     ${astroFiles.size}`);
  console.log(`  Common files:    ${inBoth.length}\n`);
  
  // Show missing files (limit output for efficiency)
  if (onlyInMiddleman.length > 0) {
    console.log(`❌ Missing in Astro (${onlyInMiddleman.length} files):`);
    const htmlFiles = onlyInMiddleman.filter(f => f.endsWith('.html'));
    const cssFiles = onlyInMiddleman.filter(f => f.endsWith('.css'));
    const jsFiles = onlyInMiddleman.filter(f => f.endsWith('.js'));
    const otherFiles = onlyInMiddleman.filter(f => 
      !f.endsWith('.html') && !f.endsWith('.css') && !f.endsWith('.js')
    );
    
    if (htmlFiles.length > 0) {
      console.log(`  📄 HTML (${htmlFiles.length}): ${htmlFiles.slice(0, 5).join(', ')}${htmlFiles.length > 5 ? '...' : ''}`);
    }
    if (cssFiles.length > 0) {
      console.log(`  🎨 CSS (${cssFiles.length}): ${cssFiles.slice(0, 3).join(', ')}${cssFiles.length > 3 ? '...' : ''}`);
    }
    if (jsFiles.length > 0) {
      console.log(`  ⚡ JS (${jsFiles.length}): ${jsFiles.slice(0, 3).join(', ')}${jsFiles.length > 3 ? '...' : ''}`);
    }
    if (otherFiles.length > 0) {
      const extensions = [...new Set(otherFiles.map(f => path.extname(f) || 'no-ext'))];
      console.log(`  📦 Other (${otherFiles.length}): ${extensions.slice(0, 10).join(', ')}${extensions.length > 10 ? '...' : ''}`);
    }
    console.log();
  }
  
  if (onlyInAstro.length > 0) {
    console.log(`✨ Only in Astro (${onlyInAstro.length} files):`);
    onlyInAstro.forEach(f => console.log(`  + ${f}`));
    console.log();
  }
  
  // For common files, do a quick diff check
  if (inBoth.length > 0) {
    console.log(`🔄 Checking content differences for ${inBoth.length} common files...`);
    let diffCount = 0;
    
    for (const file of inBoth) {
      const middlemanPath = path.join(MIDDLEMAN_BUILD, file);
      const astroPath = path.join(ASTRO_BUILD, file);
      
      try {
        execSync(`diff -q "${middlemanPath}" "${astroPath}"`, { stdio: 'pipe' });
      } catch (e) {
        diffCount++;
        if (diffCount <= 5) {
          console.log(`  ≠ ${file}`);
        }
      }
    }
    
    if (diffCount > 0) {
      console.log(`  Total files with differences: ${diffCount}/${inBoth.length}`);
    } else {
      console.log(`  ✅ All common files are identical!`);
    }
  }
  
  // Key pages to check
  console.log('\n🎯 Key pages status:');
  const keyPages = [
    'index.html',
    'blog.html', 
    'feed.xml',
    '404.html',
    'projects/dynamicland.html',
    '2025/07/27/enough-ai-copilots-we-need-ai-huds.html'
  ];
  
  keyPages.forEach(page => {
    const exists = middlemanFiles.has(page);
    const inAstro = astroFiles.has(page);
    console.log(`  ${exists ? '✓' : '✗'} Middleman | ${inAstro ? '✓' : '✗'} Astro | ${page}`);
  });
}

// Run comparison
compareBuilds();