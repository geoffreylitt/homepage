#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Ensure we're in the right directory
process.chdir('/Users/geoffreylitt/dev/homepage');

console.log('Current directory:', process.cwd());
console.log('Loading generator...');

try {
  const generator = require('./astro-port-generator/generate-transparent.js');
  console.log('Generator loaded, available functions:', Object.keys(generator));
  
  async function runPort() {
    console.log('Starting port...');
    await generator.runCompletePort();
  }
  
  runPort().catch(error => {
    console.error('Port failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Failed to load generator:', error.message);
  console.error(error.stack);
  process.exit(1);
}