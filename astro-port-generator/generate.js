#!/usr/bin/env node

/**
 * Middleman to Astro Port Generator
 * 
 * This script generates an Astro site from a Middleman site by performing
 * the same transformations that were done manually during the original port.
 * 
 * The goal is to create a deterministic, reviewable script that produces
 * the same output as the manual port process documented in port-plan.md.
 * 
 * Usage: node astro-port-generator/generate.js
 * 
 * This script operates on the assumption that:
 * - The current directory contains the Middleman source
 * - astro-port-generated/ exists and has been initialized as an Astro project
 * - We want to replicate the structure found in astro-port/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MIDDLEMAN_SOURCE = 'source';
const ASTRO_GENERATED = 'astro-port-generated';
const GENERATOR_DIR = 'astro-port-generator';
const TEMPLATES_DIR = path.join(GENERATOR_DIR, 'templates');

/**
 * Helper function to read template files
 */
function readTemplate(templatePath) {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Transform content files to match the patterns from the manual port
 * 
 * This applies the transformations that were done manually:
 * 1. Remove layout fields from frontmatter (converted to empty frontmatter)
 * 2. Convert relative image paths to absolute paths
 */
function transformContentFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Transform frontmatter: remove layout field, keeping empty frontmatter
  content = content.replace(/^---\s*\nlayout:\s*[^\n]*\n---/m, '---\n---');
  
  // Transform image paths: convert relative to absolute
  // Pattern: ![](images/...) -> ![](/images/...)
  content = content.replace(/!\[\]\(images\//g, '![](/images/');
  
  // Pattern: ![](article_images/...) -> ![](/images/article_images/...)
  content = content.replace(/!\[\]\(article_images\//g, '![](/images/article_images/');
  
  // Pattern: ![](project_images/...) -> ![](/images/project_images/...)
  content = content.replace(/!\[\]\(project_images\//g, '![](/images/project_images/');
  
  // Write the transformed content back
  fs.writeFileSync(filePath, content);
}

/**
 * Stage 1: Copy Static Assets
 * 
 * This replicates the manual copying of static files that was done in the original port.
 * All images, stylesheets, JavaScript, and other static assets need to be preserved
 * exactly as they were in the Middleman site.
 */
function copyStaticAssets() {
  console.log('📁 Stage 1: Copying static assets...');
  
  // Create public directory structure
  const publicDir = path.join(ASTRO_GENERATED, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy all static directories from Middleman source to Astro public
  const staticDirectories = [
    'images',           // All images and media files
    'stylesheets',      // Original SCSS files (for reference, Astro will compile separately)
    'javascripts',      // JavaScript files
    'resources',        // PDFs and documents
    'margin-notes',     // Complete static site
    'wildcard',         // Wildcard project files
  ];

  staticDirectories.forEach(dir => {
    const sourcePath = path.join(MIDDLEMAN_SOURCE, dir);
    const destPath = path.join(publicDir, dir);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`  Copying ${dir}/...`);
      execSync(`cp -r "${sourcePath}" "${destPath}"`);
    } else {
      console.log(`  ⚠️  ${dir}/ not found, skipping`);
    }
  });

  // Copy individual static files
  const staticFiles = [
    'favicon.svg', 
    'robots.txt',
    'resume.pdf',
    'crossdomain.xml'
  ];

  // Copy favicon.ico from images directory to public root
  const faviconSource = path.join(MIDDLEMAN_SOURCE, 'images', 'favicon.ico');
  const faviconDest = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconSource)) {
    fs.copyFileSync(faviconSource, faviconDest);
    console.log('  Copying favicon.ico from images/...');
  }

  staticFiles.forEach(file => {
    const sourcePath = path.join(MIDDLEMAN_SOURCE, file);
    const destPath = path.join(publicDir, file);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`  Copying ${file}...`);
      fs.copyFileSync(sourcePath, destPath);
    }
  });

  // Copy the special aoc2023 directory from the root (not from source/)
  const aocSource = 'aoc2023';
  const aocDest = path.join(publicDir, 'aoc2023');
  if (fs.existsSync(aocSource)) {
    console.log(`  Copying ${aocSource}/...`);
    execSync(`cp -r "${aocSource}" "${aocDest}"`);
  }

  console.log('✅ Static assets copied successfully');
}

/**
 * Stage 2: Set up Content Collections
 * 
 * Astro uses a content collections system for managing markdown content.
 * We need to copy all blog posts and project files, and set up the
 * type-safe schema configuration.
 */
function setupContentCollections() {
  console.log('📝 Stage 2: Setting up content collections...');
  
  // Create content directory structure
  const contentDir = path.join(ASTRO_GENERATED, 'src', 'content');
  const postsDir = path.join(contentDir, 'posts');
  const projectsDir = path.join(contentDir, 'projects');
  
  [contentDir, postsDir, projectsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Copy and transform blog posts from source/articles to src/content/posts
  const articlesSource = path.join(MIDDLEMAN_SOURCE, 'articles');
  if (fs.existsSync(articlesSource)) {
    console.log('  Copying and transforming blog posts...');
    execSync(`cp -r "${articlesSource}"/* "${postsDir}"/`);
    
    // Transform blog post content
    const postFiles = fs.readdirSync(postsDir);
    postFiles.forEach(file => {
      if (file.endsWith('.html.md')) {
        transformContentFile(path.join(postsDir, file));
      }
    });
  }

  // Copy and transform project pages from source/projects to src/content/projects  
  const projectsSource = path.join(MIDDLEMAN_SOURCE, 'projects');
  if (fs.existsSync(projectsSource)) {
    console.log('  Copying and transforming project pages...');
    execSync(`cp -r "${projectsSource}"/* "${projectsDir}"/`);
    
    // Transform project content
    const projectFiles = fs.readdirSync(projectsDir);
    projectFiles.forEach(file => {
      if (file.endsWith('.html.md')) {
        transformContentFile(path.join(projectsDir, file));
      }
    });
  }

  console.log('✅ Content collections set up successfully');
}

/**
 * Stage 3: Create Configuration Files
 * 
 * Sets up Astro-specific configuration files that enable the project to work:
 * - astro.config.mjs: Site configuration with SCSS and RSS support
 * - package.json: Dependencies for Astro, SASS, YAML, and RSS
 * - src/content/config.ts: Type-safe content collection schemas
 * - src/data/*.yml: Data files copied from root data directory
 */
function createConfigurationFiles() {
  console.log('⚙️  Stage 3: Creating configuration files...');
  
  // Update astro.config.mjs with the template
  const astroConfig = readTemplate('config/astro.config.mjs');
  fs.writeFileSync(path.join(ASTRO_GENERATED, 'astro.config.mjs'), astroConfig);
  console.log('  Updated astro.config.mjs');

  // Update package.json with the template
  const packageJsonTemplate = readTemplate('config/package.json');
  fs.writeFileSync(path.join(ASTRO_GENERATED, 'package.json'), packageJsonTemplate);
  console.log('  Updated package.json');

  // Create content collection configuration
  const contentConfig = readTemplate('config/content-config.ts');
  const contentDir = path.join(ASTRO_GENERATED, 'src', 'content');
  fs.writeFileSync(path.join(contentDir, 'config.ts'), contentConfig);
  console.log('  Created src/content/config.ts');

  // Copy data files from root data directory to src/data
  const dataDir = path.join(ASTRO_GENERATED, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Copy YAML data files
  const dataFiles = ['projects.yml', 'interviews.yml'];
  dataFiles.forEach(file => {
    const sourcePath = path.join('data', file);
    const destPath = path.join(dataDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  Copied ${file} to src/data/`);
    }
  });

  console.log('✅ Configuration files created successfully');
}

/**
 * Stage 4: Create Styles Directory
 * 
 * Copies SCSS files from source/stylesheets to src/styles for Astro compilation.
 * This allows Astro to compile the SCSS directly instead of using pre-built CSS.
 */
function createStylesDirectory() {
  console.log('🎨 Stage 4: Setting up styles...');
  
  const stylesDir = path.join(ASTRO_GENERATED, 'src', 'styles');
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }

  // Copy stylesheets from source to src/styles
  const sourceStylesDir = path.join(MIDDLEMAN_SOURCE, 'stylesheets');
  if (fs.existsSync(sourceStylesDir)) {
    execSync(`cp -r "${sourceStylesDir}"/* "${stylesDir}"/`);
    console.log('  Copied SCSS files to src/styles/');
  }

  console.log('✅ Styles directory set up successfully');
}

/**
 * Stage 5: Generate Layout Components
 * 
 * Creates the essential Astro layout components using template files.
 * These templates capture the core structure extracted from the existing port.
 */
function generateLayoutComponents() {
  console.log('🧱 Stage 5: Generating layout components...');
  
  const layoutsDir = path.join(ASTRO_GENERATED, 'src', 'layouts');
  if (!fs.existsSync(layoutsDir)) {
    fs.mkdirSync(layoutsDir, { recursive: true });
  }

  // Generate layout components from templates
  const layoutTemplates = [
    { template: 'layouts/BaseLayout.astro', output: 'BaseLayout.astro' },
    { template: 'layouts/BlogPostLayout.astro', output: 'BlogPostLayout.astro' }
  ];

  layoutTemplates.forEach(({ template, output }) => {
    const content = readTemplate(template);
    fs.writeFileSync(path.join(layoutsDir, output), content);
    console.log(`  Generated ${output}`);
  });

  console.log('✅ Layout components generated successfully');
}

/**
 * Stage 6: Generate Page Components
 * 
 * Creates the essential page components that handle routing and content display
 * using template files. These follow patterns extracted from the existing port.
 */
function generatePageComponents() {
  console.log('📄 Stage 6: Generating page components...');
  
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  const componentsDir = path.join(ASTRO_GENERATED, 'src', 'components');
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Generate ProjectGrid component
  const projectGridContent = readTemplate('components/ProjectGrid.astro');
  fs.writeFileSync(path.join(componentsDir, 'ProjectGrid.astro'), projectGridContent);
  console.log('  Generated ProjectGrid.astro');

  // Generate page components from templates
  const pageTemplates = [
    { template: 'pages/index.astro', output: 'index.astro' },
    { template: 'pages/slug.astro', output: '[...slug].astro' },
    { template: 'pages/blog.astro', output: 'blog.astro' },
    { template: 'pages/404.astro', output: '404.astro' }
  ];
  
  // Generate project pages
  const projectsPageDir = path.join(pagesDir, 'projects');
  if (!fs.existsSync(projectsPageDir)) {
    fs.mkdirSync(projectsPageDir, { recursive: true });
  }
  
  const projectSlugContent = readTemplate('pages/projects/slug.astro');
  fs.writeFileSync(path.join(projectsPageDir, '[slug].astro'), projectSlugContent);
  console.log('  Generated projects/[slug].astro');

  pageTemplates.forEach(({ template, output }) => {
    const content = readTemplate(template);
    fs.writeFileSync(path.join(pagesDir, output), content);
    console.log(`  Generated ${output}`);
  });

  console.log('✅ Page components generated successfully');
}

/**
 * Stage 7: Generate Special Pages from Markdown
 * 
 * Handles special pages that are in markdown format in the Middleman source
 * and need to be converted to Astro components with proper layouts.
 */
function generateSpecialPages() {
  console.log('📄 Stage 7: Generating special pages from markdown...');
  
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  
  // Handle inspirations.html.md
  const inspirationsSource = path.join(MIDDLEMAN_SOURCE, 'inspirations.html.md');
  if (fs.existsSync(inspirationsSource)) {
    let content = fs.readFileSync(inspirationsSource, 'utf8');
    
    // Transform the markdown content to Astro
    // Remove frontmatter and extract metadata
    content = content.replace(/^---\s*\nlayout:\s*[^\n]*\n---\s*\n/m, '');
    
    // Convert markdown lists to HTML
    content = content.replace(/^\* \[([^\]]+)\]\(([^)]+)\)$/gm, '        <li><a href="$2">$1</a></li>');
    
    // Fix image path
    content = content.replace(/!\[\]\(\/images\/computing-books\.jpg\)/g, '<img src="/images/computing-books.jpg" alt="Computing books on bookshelf" />');
    
    // Wrap in Astro component
    const astroContent = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="Inspirations - Geoffrey Litt"
  description="People whose work I've found inspirational"
>
  <div class="container">
    <div class="one-column">
${content.replace(/^(.*)$/gm, '      $1')}
    </div>
  </div>
</BaseLayout>`;
    
    fs.writeFileSync(path.join(pagesDir, 'inspirations.astro'), astroContent);
    console.log('  Generated inspirations.astro from source markdown');
  }
  
  // Handle wildcard/index.html.md
  const wildcardSource = path.join(MIDDLEMAN_SOURCE, 'wildcard', 'index.html.md');
  if (fs.existsSync(wildcardSource)) {
    let content = fs.readFileSync(wildcardSource, 'utf8');
    
    // Extract frontmatter metadata
    const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/ms);
    let title = 'Wildcard';
    let description = 'Wildcard lets anyone modify websites using a familiar spreadsheet view.';
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      if (titleMatch) title = titleMatch[1];
      if (descMatch) description = descMatch[1];
      
      // Remove frontmatter
      content = content.replace(frontmatterMatch[0], '');
    }
    
    // Convert markdown lists to HTML
    content = content.replace(/^- \*\*([^*]+)\*\*:\s*(.+)$/gm, '          <li><strong>$1</strong>: $2</li>');
    content = content.replace(/^- (.+)$/gm, '          <li>$1</li>');
    
    // Wrap in Astro component
    const astroContent = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="${title}"
  description="${description}"
>
  <div class="one-column">
    <article class="post single">
      <div class="post-content">
${content.replace(/^(.*)$/gm, '        $1')}
      </div>
    </article>
  </div>
</BaseLayout>`;
    
    fs.writeFileSync(path.join(pagesDir, 'wildcard.astro'), astroContent);
    console.log('  Generated wildcard.astro from source markdown');
  }
  
  console.log('✅ Special pages generated successfully');
}

/**
 * Initialize Astro Project
 * 
 * Handles the setup of the target directory including:
 * - Removing existing generated directory
 * - Creating fresh Astro project
 * - Installing dependencies
 */
function initializeAstroProject() {
  console.log('🏗️  Initializing Astro project...');
  
  // Remove existing directory if it exists
  if (fs.existsSync(ASTRO_GENERATED)) {
    console.log(`  Removing existing ${ASTRO_GENERATED}/...`);
    execSync(`rm -rf "${ASTRO_GENERATED}"`);
  }

  // Create directory
  fs.mkdirSync(ASTRO_GENERATED);
  console.log(`  Created ${ASTRO_GENERATED}/`);

  // Initialize Astro project
  console.log('  Initializing Astro project...');
  execSync(`cd "${ASTRO_GENERATED}" && npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict`, { stdio: 'pipe' });

  // Install dependencies (will be overwritten later with our package.json)
  console.log('  Installing dependencies...');
  execSync(`cd "${ASTRO_GENERATED}" && npm install`, { stdio: 'pipe' });

  console.log('✅ Astro project initialized successfully');
}

/**
 * Main execution function
 * 
 * Orchestrates the generation process by calling each stage in sequence.
 * This follows the same progression documented in port-plan.md.
 */
function main() {
  console.log('🚀 Starting Middleman to Astro port generation...');
  console.log(`📂 Source: ${MIDDLEMAN_SOURCE}/`);
  console.log(`📂 Target: ${ASTRO_GENERATED}/`);
  console.log(`📂 Templates: ${TEMPLATES_DIR}/`);
  console.log('');

  try {
    // Verify that required directories exist
    if (!fs.existsSync(MIDDLEMAN_SOURCE)) {
      throw new Error(`Middleman source directory "${MIDDLEMAN_SOURCE}" not found`);
    }

    if (!fs.existsSync(TEMPLATES_DIR)) {
      throw new Error(`Templates directory "${TEMPLATES_DIR}" not found`);
    }

    // Execute generation stages
    initializeAstroProject();
    copyStaticAssets();
    setupContentCollections();
    createConfigurationFiles();
    createStylesDirectory();
    generateLayoutComponents();
    generatePageComponents();
    generateSpecialPages();

    console.log('');
    console.log('🎉 Generation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the verification script: node verify-port.js');
    console.log('2. Review differences and continue implementing remaining stages');
    console.log(`3. Test the generated site: cd ${ASTRO_GENERATED} && npm run dev`);

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  initializeAstroProject,
  copyStaticAssets,
  setupContentCollections,
  createConfigurationFiles,
  createStylesDirectory,
  generateLayoutComponents,
  generatePageComponents,
  generateSpecialPages,
  readTemplate,
  transformContentFile,
  main
};