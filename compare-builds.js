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

// Convert Astro paths to Middleman equivalents for comparison
function astroToMiddlemanPath(astroPath) {
  // Convert /path/to/page/index.html -> /path/to/page.html
  if (astroPath.endsWith('/index.html')) {
    return astroPath.replace('/index.html', '.html');
  }
  return astroPath;
}

// Convert Middleman paths to Astro equivalents for comparison  
function middlemanToAstroPath(middlemanPath) {
  // Convert /path/to/page.html -> /path/to/page/index.html
  // But skip root index.html and certain special files
  if (middlemanPath === 'index.html' || 
      middlemanPath.endsWith('feed.xml') || 
      middlemanPath.endsWith('404.html') ||
      middlemanPath.endsWith('blog.html') ||
      !middlemanPath.endsWith('.html')) {
    return middlemanPath;
  }
  
  const basePath = middlemanPath.replace(/\.html$/, '');
  return `${basePath}/index.html`;
}

function compareBuilds() {
  console.log('🔍 Comparing build directories...\n');
  console.log(`Middleman build: ${MIDDLEMAN_BUILD}`);
  console.log(`Astro build:     ${ASTRO_BUILD}\n`);
  
  // Get all files from both directories
  const middlemanFiles = new Set(getAllFiles(MIDDLEMAN_BUILD));
  const astroFiles = new Set(getAllFiles(ASTRO_BUILD));
  
  // Create normalized comparison sets
  const middlemanNormalized = new Map();
  const astroNormalized = new Map();
  
  // Map Middleman files to their normalized paths
  middlemanFiles.forEach(file => {
    const normalized = middlemanToAstroPath(file);
    middlemanNormalized.set(normalized, file);
  });
  
  // Map Astro files to their normalized paths  
  astroFiles.forEach(file => {
    const normalized = astroToMiddlemanPath(file);
    astroNormalized.set(normalized, file);
  });
  
  // Find matches using normalized paths
  const matchedPages = [];
  const onlyInMiddleman = [];
  const onlyInAstro = [];
  
  // Check Middleman files
  middlemanFiles.forEach(middlemanFile => {
    const normalizedPath = middlemanToAstroPath(middlemanFile);
    if (astroFiles.has(normalizedPath)) {
      matchedPages.push({ middleman: middlemanFile, astro: normalizedPath });
    } else {
      onlyInMiddleman.push(middlemanFile);
    }
  });
  
  // Check Astro files not already matched
  astroFiles.forEach(astroFile => {
    const normalizedPath = astroToMiddlemanPath(astroFile);
    const isMatched = matchedPages.some(m => m.astro === astroFile);
    if (!isMatched && !middlemanFiles.has(normalizedPath)) {
      onlyInAstro.push(astroFile);
    }
  });
  
  // Files in both builds (accounting for path differences)
  const inBoth = matchedPages.map(m => m.middleman);
  
  // Summary stats
  console.log('📊 Summary:');
  console.log(`  Middleman files: ${middlemanFiles.size}`);
  console.log(`  Astro files:     ${astroFiles.size}`);
  console.log(`  Matched pages:   ${matchedPages.length} (accounting for /index.html structure differences)\n`);
  
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
  
  // For matched pages, do a quick diff check
  if (matchedPages.length > 0) {
    console.log(`🔄 Checking content differences for ${matchedPages.length} matched pages...`);
    let diffCount = 0;
    
    for (const { middleman, astro } of matchedPages) {
      const middlemanPath = path.join(MIDDLEMAN_BUILD, middleman);
      const astroPath = path.join(ASTRO_BUILD, astro);
      
      // Skip content comparison for binary files and certain file types
      if (middleman.match(/\.(jpg|jpeg|png|gif|pdf|ico|svg|woff|woff2|eot|ttf)$/i)) {
        continue;
      }
      
      try {
        execSync(`diff -q "${middlemanPath}" "${astroPath}"`, { stdio: 'pipe' });
      } catch (e) {
        diffCount++;
        if (diffCount <= 5) {
          console.log(`  ≠ ${middleman} ↔ ${astro}`);
        }
      }
    }
    
    if (diffCount > 0) {
      console.log(`  Total pages with differences: ${diffCount}/${matchedPages.length}`);
    } else {
      console.log(`  ✅ All matched pages are identical!`);
    }
  }
  
  // Key pages to check (accounting for path structure differences)
  console.log('\n🎯 Key pages status:');
  const keyPages = [
    { middleman: 'index.html', astro: 'index.html' },
    { middleman: 'blog.html', astro: 'blog.html' }, 
    { middleman: 'feed.xml', astro: 'feed.xml' },
    { middleman: '404.html', astro: '404.html' },
    { middleman: 'projects/dynamicland.html', astro: 'projects/dynamicland/index.html' },
    { middleman: '2025/07/27/enough-ai-copilots-we-need-ai-huds.html', astro: '2025/07/27/enough-ai-copilots-we-need-ai-huds/index.html' }
  ];
  
  keyPages.forEach(({ middleman, astro }) => {
    const existsInMiddleman = middlemanFiles.has(middleman);
    const existsInAstro = astroFiles.has(astro);
    const symbol = existsInMiddleman && existsInAstro ? '✓' : (existsInMiddleman && !existsInAstro) ? '➜' : '✗';
    console.log(`  ${existsInMiddleman ? '✓' : '✗'} Middleman | ${existsInAstro ? '✓' : '✗'} Astro | ${middleman} ${symbol === '➜' ? '→ ' + astro : ''}`);
  });
}

// Run comparison
compareBuilds();