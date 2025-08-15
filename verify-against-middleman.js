#!/usr/bin/env node

/**
 * Middleman vs Generated Astro Site Verification
 * 
 * This script:
 * 1. Generates a fresh Astro site using the generator
 * 2. Builds the Astro site 
 * 3. Serves both the original Middleman site and built Astro site
 * 4. Compares key pages to verify functional equivalence
 * 
 * The goal is to verify that the generated Astro site produces 
 * the same user experience as the original Middleman site.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const MIDDLEMAN_DIR = '.';
const ASTRO_GENERATED = 'astro-port-generated';
const ASTRO_DIST = path.join(ASTRO_GENERATED, 'dist');

// Test URLs to compare
const TEST_URLS = [
  '/',
  '/blog',
  '/inspirations',
  '/wildcard',
  '/2023/03/25/llm-end-user-programming/',
  '/projects/wildcard',
  '/feed.xml'
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
 * Check if a port is in use
 */
function isPortInUse(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Start a server process
 */
function startServer(command, cwd, expectedPort, name) {
  console.log(`🚀 Starting ${name} server...`);
  
  if (isPortInUse(expectedPort)) {
    console.log(`  ⚠️  Port ${expectedPort} already in use, assuming ${name} is running`);
    return null;
  }

  const process = spawn('bash', ['-c', command], { 
    cwd, 
    stdio: 'pipe',
    detached: false 
  });

  return new Promise((resolve, reject) => {
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes(`localhost:${expectedPort}`) || output.includes(`:${expectedPort}`)) {
        console.log(`  ✅ ${name} server started on port ${expectedPort}`);
        resolve(process);
      }
    });

    process.stderr.on('data', (data) => {
      const error = data.toString();
      // Ignore common dev server warnings
      if (!error.includes('WARNING') && !error.includes('deprecated')) {
        console.log(`  ${name} stderr:`, error);
      }
    });

    process.on('error', reject);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!process.killed) {
        console.log(`  ⚠️  ${name} server seems to be starting (timeout reached)`);
        resolve(process);
      }
    }, 30000);
  });
}

/**
 * Fetch URL and return status and basic info
 */
async function fetchUrl(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    return {
      url,
      status: response.status,
      size: text.length,
      hasContent: text.length > 100,
      title: text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title',
      isHTML: response.headers.get('content-type')?.includes('text/html'),
      isXML: response.headers.get('content-type')?.includes('xml') || path.endsWith('.xml')
    };
  } catch (error) {
    return {
      url,
      status: 'ERROR',
      error: error.message,
      size: 0,
      hasContent: false
    };
  }
}

/**
 * Compare two URL responses
 */
function compareResponses(middleman, astro, path) {
  const issues = [];
  
  if (middleman.status !== astro.status) {
    issues.push(`Status mismatch: ${middleman.status} vs ${astro.status}`);
  }
  
  if (middleman.status === 200 && astro.status === 200) {
    if (!middleman.hasContent && !astro.hasContent) {
      issues.push('Both responses are empty');
    } else if (!middleman.hasContent) {
      issues.push('Middleman response is empty');
    } else if (!astro.hasContent) {
      issues.push('Astro response is empty');
    }
    
    // For HTML pages, compare titles
    if (middleman.isHTML && astro.isHTML && middleman.title && astro.title) {
      if (middleman.title !== astro.title) {
        issues.push(`Title mismatch: "${middleman.title}" vs "${astro.title}"`);
      }
    }
    
    // Size comparison (allow some variance for built vs dev)
    const sizeDiff = Math.abs(middleman.size - astro.size);
    const sizeRatio = sizeDiff / Math.max(middleman.size, astro.size);
    if (sizeRatio > 0.5) { // More than 50% difference
      issues.push(`Significant size difference: ${middleman.size} vs ${astro.size} bytes`);
    }
  }
  
  return issues;
}

/**
 * Main verification function
 */
async function main() {
  console.log('🔍 Middleman vs Astro Site Verification');
  console.log('=========================================\n');

  let middlemanServer = null;
  let astroServer = null;

  try {
    // Step 1: Generate Astro site
    console.log('📄 Step 1: Generating Astro site...');
    if (fs.existsSync(ASTRO_GENERATED)) {
      console.log(`  Removing existing ${ASTRO_GENERATED}/...`);
      execCommand(`rm -rf "${ASTRO_GENERATED}"`);
      // Wait a bit to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    execCommand('node astro-port-generator/generate.js');
    
    // Install additional dependencies needed for build
    console.log('  Installing RSS dependency...');
    execCommand('npm install', { cwd: ASTRO_GENERATED });
    console.log('  ✅ Astro site generated\n');

    // Step 2: Build Astro site
    console.log('📦 Step 2: Building Astro site...');
    execCommand('npm run build', { cwd: ASTRO_GENERATED });
    console.log('  ✅ Astro site built\n');

    // Step 3: Start Middleman server
    console.log('🖥️  Step 3: Starting servers...');
    middlemanServer = await startServer(
      'bundle exec middleman server -p 4567',
      MIDDLEMAN_DIR,
      4567,
      'Middleman'
    );

    // Step 4: Start Astro preview server
    astroServer = await startServer(
      'npm run preview -- --port 4568',
      ASTRO_GENERATED,
      4568,
      'Astro'
    );

    // Wait a bit for servers to fully start
    console.log('  ⏳ Waiting for servers to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 5: Test URLs
    console.log('\n🧪 Step 4: Testing URLs...\n');
    
    const results = [];
    let passCount = 0;
    let totalTests = 0;

    for (const testPath of TEST_URLS) {
      console.log(`Testing ${testPath}...`);
      
      const [middlemanResult, astroResult] = await Promise.all([
        fetchUrl('http://localhost:4567', testPath),
        fetchUrl('http://localhost:4568', testPath)
      ]);

      const issues = compareResponses(middlemanResult, astroResult, testPath);
      totalTests++;
      
      if (issues.length === 0) {
        console.log(`  ✅ PASS`);
        passCount++;
      } else {
        console.log(`  ❌ FAIL`);
        issues.forEach(issue => console.log(`    - ${issue}`));
      }
      
      results.push({
        path: testPath,
        middleman: middlemanResult,
        astro: astroResult,
        issues,
        passed: issues.length === 0
      });
    }

    // Summary
    console.log('\n📊 Summary');
    console.log('===========');
    console.log(`Tests passed: ${passCount}/${totalTests}`);
    console.log(`Success rate: ${((passCount/totalTests) * 100).toFixed(1)}%`);
    
    if (passCount === totalTests) {
      console.log('\n🎉 All tests passed! The generated Astro site matches the original Middleman site.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.');
    }

    // Detailed results
    console.log('\n📋 Detailed Results');
    console.log('==================');
    results.forEach(result => {
      console.log(`\n${result.path}:`);
      console.log(`  Middleman: ${result.middleman.status} (${result.middleman.size} bytes)`);
      console.log(`  Astro:     ${result.astro.status} (${result.astro.size} bytes)`);
      if (result.issues.length > 0) {
        console.log(`  Issues:    ${result.issues.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up servers...');
    if (middlemanServer) {
      middlemanServer.kill();
      console.log('  Stopped Middleman server');
    }
    if (astroServer) {
      astroServer.kill(); 
      console.log('  Stopped Astro server');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };