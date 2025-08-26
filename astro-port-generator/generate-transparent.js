#!/usr/bin/env node

/**
 * Middleman to Astro Port Generator - Transparent Version
 * 
 * This version uses the CommandExecutor to make all shell commands
 * visible in the web UI for full transparency.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MIDDLEMAN_SOURCE = 'source';
const ASTRO_GENERATED = 'astro-port-generated';
const GENERATOR_DIR = 'astro-port-generator';
const TEMPLATES_DIR = path.join(GENERATOR_DIR, 'templates');

// Will be set by the interactive system
let commandExecutor = null;

/**
 * Set the command executor (called by the interactive system)
 */
function setCommandExecutor(executor) {
  commandExecutor = executor;
}

/**
 * Execute a shell command through the command executor
 */
async function execSync(command, options = {}) {
  if (commandExecutor) {
    return await commandExecutor.execSync(command, options);
  } else {
    // Fallback to regular execSync if no executor is set
    const { execSync } = require('child_process');
    return execSync(command, { encoding: 'utf8', ...options });
  }
}

/**
 * Add an info message to the terminal
 */
function addInfo(message) {
  if (commandExecutor) {
    commandExecutor.addInfo(message);
  } else {
    console.log(message);
  }
}

/**
 * Helper function to read template files
 */
function readTemplate(templatePath) {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Transform content files to match the patterns from the manual port
 */
function transformContentFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  
  // Validate content before processing
  const originalLines = originalContent.split('\n').length;
  const originalCharCount = originalContent.length;
  
  addInfo(`📄 Processing ${path.basename(filePath)} - ${originalLines} lines, ${originalCharCount} characters`);
  
  // Transform frontmatter: remove layout field
  content = content.replace(/^layout:\s*[^\n]*\n/m, '');
  
  // Transform image paths: convert relative to absolute
  content = content.replace(/!\[([^\]]*)\]\(images\//g, '![$1](/images/');
  content = content.replace(/!\[([^\]]*)\]\(article_images\//g, '![$1](/images/article_images/');
  content = content.replace(/!\[([^\]]*)\]\(project_images\//g, '![$1](/images/project_images/');
  
  // Fix self-closing video tags - ensure they remain self-closing for proper HTML
  content = content.replace(/<video([^>]*?)\s*\/>/g, '<video$1></video>');
  
  // Validate content after processing
  const processedLines = content.split('\n').length;
  const processedCharCount = content.length;
  
  // Check for significant content loss (more than 10% reduction)
  const lineReduction = (originalLines - processedLines) / originalLines;
  const charReduction = (originalCharCount - processedCharCount) / originalCharCount;
  
  if (lineReduction > 0.1 || charReduction > 0.1) {
    addInfo(`⚠️  WARNING: Significant content reduction detected in ${path.basename(filePath)}:`);
    addInfo(`   Lines: ${originalLines} → ${processedLines} (${(lineReduction * 100).toFixed(1)}% reduction)`);
    addInfo(`   Characters: ${originalCharCount} → ${processedCharCount} (${(charReduction * 100).toFixed(1)}% reduction)`);
  } else {
    addInfo(`✅ Content preserved - ${processedLines} lines, ${processedCharCount} characters`);
  }
  
  fs.writeFileSync(filePath, content);
}

/**
 * Stage 1: Initialize Basic Site
 */
async function initializeBasicSite() {
  addInfo('🏗️  Initializing basic site...');
  
  // Remove existing directory if it exists
  if (fs.existsSync(ASTRO_GENERATED)) {
    addInfo(`Removing existing ${ASTRO_GENERATED}/...`);
    await execSync(`rm -rf "${ASTRO_GENERATED}"`);
  }

  // Create directory
  fs.mkdirSync(ASTRO_GENERATED);
  addInfo(`Created ${ASTRO_GENERATED}/`);

  // Initialize Astro project
  addInfo('Initializing Astro project...');
  await execSync(`cd "${ASTRO_GENERATED}" && npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict`);

  // Install dependencies
  addInfo('Installing dependencies...');
  await execSync(`cd "${ASTRO_GENERATED}" && npm install`);

  // Copy essential images first (for profile photo)
  addInfo('📸 Copying essential images...');
  const publicDir = path.join(ASTRO_GENERATED, 'public');
  const imagesDir = path.join(publicDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const sourceImagesDir = path.join(MIDDLEMAN_SOURCE, 'images');
  if (fs.existsSync(sourceImagesDir)) {
    await execSync(`cp -r "${sourceImagesDir}"/* "${imagesDir}"/`);
  }

  // Create basic homepage with content but no styling
  addInfo('📝 Creating basic homepage...');
  const basicHomepage = `---
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>Geoffrey Litt</title>
  </head>
  <body>
    <header>
      <img src="/images/headshot.jpg" width="100" alt="Geoffrey Litt" />
      <h1><a href="/">Geoffrey Litt</a></h1>
      <nav>
        <a href="/#projects">Projects</a>
        <a href="/#writing">Writing</a>
        <a href="/inspirations.html">Inspirations</a>
      </nav>
    </header>

    <main>
      <div>
        <p>
          Welcome! I work on <em>malleable software</em>: computing environments where anyone can adapt their software to meet their needs with minimal friction. To see what that means to me, read <a href="https://www.inkandswitch.com/essay/malleable-software/">this essay</a> or listen to <a href="https://jacksondahl.com/dialectic/geoffrey-litt">this interview</a>.
        </p>

        <p>
          I'm also tinkering with AI-assisted programming, which I think can help usher in a <a href="/2023/03/25/llm-end-user-programming.html">new era of personal software tools</a>, help programmers <a href="/2024/12/22/making-programming-more-fun-with-an-ai-generated-debugger.html">have more fun</a>, and <a href="/2023/07/25/building-personal-tools-on-the-fly-with-llms.html">create new interaction patterns</a> for working with software.
        </p>

        <p>
          I'm currently a senior researcher at the independent research lab <a href="https://www.inkandswitch.com/">Ink & Switch</a>. Previously I did a PhD in HCI at MIT—researching end-user programming interfaces, advised by <a href="http://people.csail.mit.edu/dnj/">Daniel Jackson</a>. Earlier in my career I did design and engineering at <a href="https://www.panoramaed.com/">startups</a>. My core skill is designing and prototyping environments for thinking.
        </p>

        <p>
          You can reach me via <a href="mailto:gklitt@gmail.com">email</a>. I enjoy hearing from people making cool stuff! I also do a bit of startup advising for companies related to my work.
        </p>

        <p>
          If you'd like to hear occasional updates on my work, you can <a href="https://buttondown.email/geoffreylitt">subscribe to my email newsletter</a> or <a href="/feed.xml">follow via RSS</a>.
        </p>
      </div>

      <h2>Contact me</h2>
      <p>
        <strong>Please reach out</strong> if you're interested in chatting about ideas, or if I might be able to help you in some way. You can contact me via <a href="mailto:gklitt@gmail.com">email</a> or on <a href="http://www.twitter.com/geoffreylitt">Twitter</a>.
      </p>
    </main>
  </body>
</html>`;
  
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  fs.writeFileSync(path.join(pagesDir, 'index.astro'), basicHomepage);

  addInfo('✅ Basic site initialized with content and navigation');
}

/**
 * Stage 2: Add Core Styling
 */
async function addCoreStyling() {
  addInfo('🎨 Adding core styling...');
  
  // Create styles directory and copy SCSS files
  const stylesDir = path.join(ASTRO_GENERATED, 'src', 'styles');
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }

  const sourceStylesDir = path.join(MIDDLEMAN_SOURCE, 'stylesheets');
  if (fs.existsSync(sourceStylesDir)) {
    addInfo('Copying SCSS files...');
    await execSync(`cp -r "${sourceStylesDir}"/* "${stylesDir}"/`);
  }

  // Create layouts directory
  const layoutsDir = path.join(ASTRO_GENERATED, 'src', 'layouts');
  if (!fs.existsSync(layoutsDir)) {
    fs.mkdirSync(layoutsDir, { recursive: true });
  }

  // Update package.json to include sass-embedded before using SCSS
  addInfo('⚙️  Adding SCSS dependencies...');
  const packageJsonTemplate = readTemplate('config/package.json');
  fs.writeFileSync(path.join(ASTRO_GENERATED, 'package.json'), packageJsonTemplate);

  addInfo('Installing SCSS dependencies...');
  await execSync(`cd "${ASTRO_GENERATED}" && npm install`);

  // Create BaseLayout with styling
  addInfo('🧱 Creating styled BaseLayout...');
  const baseLayoutTemplate = readTemplate('layouts/BaseLayout.astro');
  fs.writeFileSync(path.join(layoutsDir, 'BaseLayout.astro'), baseLayoutTemplate);

  // Update homepage to use BaseLayout
  addInfo('📝 Updating homepage with styled layout...');
  const styledHomepage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Geoffrey Litt">
  <div class="home-body-text">
    <p>
      Welcome! I work on <em>malleable software</em>: computing environments where anyone can adapt their software to meet their needs with minimal friction. To see what that means to me, read <a href="https://www.inkandswitch.com/essay/malleable-software/">this essay</a> or listen to <a href="https://jacksondahl.com/dialectic/geoffrey-litt">this interview</a>.
    </p>

    <p>
      I'm also tinkering with AI-assisted programming, which I think can help usher in a <a href="/2023/03/25/llm-end-user-programming.html">new era of personal software tools</a>, help programmers <a href="/2024/12/22/making-programming-more-fun-with-an-ai-generated-debugger.html">have more fun</a>, and <a href="/2023/07/25/building-personal-tools-on-the-fly-with-llms.html">create new interaction patterns</a> for working with software.
    </p>

    <p>
      I'm currently a senior researcher at the independent research lab <a href="https://www.inkandswitch.com/">Ink & Switch</a>. Previously I did a PhD in HCI at MIT—researching end-user programming interfaces, advised by <a href="http://people.csail.mit.edu/dnj/">Daniel Jackson</a>. Earlier in my career I did design and engineering at <a href="https://www.panoramaed.com/">startups</a>. My core skill is designing and prototyping environments for thinking.
    </p>

    <p>
      You can reach me via <a href="mailto:gklitt@gmail.com">email</a>. I enjoy hearing from people making cool stuff! I also do a bit of startup advising for companies related to my work.
    </p>

    <p>
      If you'd like to hear occasional updates on my work, you can <a href="https://buttondown.email/geoffreylitt">subscribe to my email newsletter</a> or <a href="/feed.xml">follow via RSS</a>.
    </p>
  </div>

  <a id="contact"></a>
  <h2 class="project-category">Contact me</h2>
  <div class="home-body-text">
    <p>
      <strong>Please reach out</strong> if you're interested in chatting about ideas, or if I might be able to help you in some way. You can contact me via <a href="mailto:gklitt@gmail.com">email</a> or on <a href="http://www.twitter.com/geoffreylitt">Twitter</a>.
    </p>
  </div>
</BaseLayout>`;
  
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  fs.writeFileSync(path.join(pagesDir, 'index.astro'), styledHomepage);

  // Copy remaining static assets
  addInfo('📁 Copying remaining static assets...');
  const publicDir = path.join(ASTRO_GENERATED, 'public');
  
  // Copy other static directories
  const staticDirectories = [
    'stylesheets',
    'javascripts',
    'resources',
    'margin-notes',
    'wildcard',
  ];

  for (const dir of staticDirectories) {
    const sourcePath = path.join(MIDDLEMAN_SOURCE, dir);
    const destPath = path.join(publicDir, dir);
    
    if (fs.existsSync(sourcePath)) {
      addInfo(`Copying ${dir}/...`);
      await execSync(`cp -r "${sourcePath}" "${destPath}"`);
    }
  }

  // Copy individual static files
  const staticFiles = [
    'favicon.svg', 
    'robots.txt',
    'resume.pdf',
    'crossdomain.xml'
  ];

  for (const file of staticFiles) {
    const sourcePath = path.join(MIDDLEMAN_SOURCE, file);
    const destPath = path.join(publicDir, file);
    
    if (fs.existsSync(sourcePath)) {
      addInfo(`Copying ${file}...`);
      await execSync(`cp "${sourcePath}" "${destPath}"`);
    }
  }

  // Copy the special aoc2023 directory from the root
  const aocSource = 'aoc2023';
  const aocDest = path.join(publicDir, 'aoc2023');
  if (fs.existsSync(aocSource)) {
    addInfo(`Copying ${aocSource}/...`);
    await execSync(`cp -r "${aocSource}" "${aocDest}"`);
  }

  addInfo('✅ Core styling and assets added successfully');
}

/**
 * Stage 3: Set up Content Collections
 */
async function setupContentCollections() {
  addInfo('📝 Setting up content collections...');
  
  // Create content directory structure
  const contentDir = path.join(ASTRO_GENERATED, 'src', 'content');
  const postsDir = path.join(contentDir, 'posts');
  const projectsDir = path.join(contentDir, 'projects');
  const pagesDir = path.join(contentDir, 'pages');
  
  [contentDir, postsDir, projectsDir, pagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Copy and transform blog posts
  const articlesSource = path.join(MIDDLEMAN_SOURCE, 'articles');
  if (fs.existsSync(articlesSource)) {
    const sourceFiles = fs.readdirSync(articlesSource).filter(f => f.endsWith('.html.md'));
    addInfo(`📝 Found ${sourceFiles.length} blog posts to copy and transform`);
    
    await execSync(`cp -r "${articlesSource}"/* "${postsDir}"/`);
    addInfo('✅ Blog posts copied successfully');
    
    // Transform blog post content
    const postFiles = fs.readdirSync(postsDir);
    let processedCount = 0;
    postFiles.forEach(file => {
      if (file.endsWith('.html.md')) {
        transformContentFile(path.join(postsDir, file));
        processedCount++;
      }
    });
    
    addInfo(`🔄 Processed ${processedCount} blog posts`);
    if (processedCount !== sourceFiles.length) {
      addInfo(`⚠️  WARNING: Copied ${sourceFiles.length} files but only processed ${processedCount}`);
    }
  }

  // Copy and transform project pages
  const projectsSource = path.join(MIDDLEMAN_SOURCE, 'projects');
  if (fs.existsSync(projectsSource)) {
    addInfo('Copying and transforming project pages...');
    await execSync(`cp -r "${projectsSource}"/* "${projectsDir}"/`);
    
    // Transform project content
    const projectFiles = fs.readdirSync(projectsDir);
    projectFiles.forEach(file => {
      if (file.endsWith('.html.md')) {
        transformContentFile(path.join(projectsDir, file));
      }
    });
  }

  // Copy standalone pages
  addInfo('Copying standalone pages...');
  
  const inspirationsSource = path.join(MIDDLEMAN_SOURCE, 'inspirations.html.md');
  if (fs.existsSync(inspirationsSource)) {
    // Copy to pages directory, not content/pages, so Astro will build it as a route
    const pagesRouteDir = path.join(ASTRO_GENERATED, 'src', 'pages');
    const inspirationsDest = path.join(pagesRouteDir, 'inspirations.md');
    await execSync(`cp "${inspirationsSource}" "${inspirationsDest}"`);
    transformContentFile(inspirationsDest);
    addInfo('✅ Copied inspirations page to pages directory');
  }
  
  // Handle redirect files (like wildcard/index.html.md -> /projects/wildcard)
  addInfo('Processing redirect files...');
  const wildcardRedirectSource = path.join(MIDDLEMAN_SOURCE, 'wildcard', 'index.html.md');
  if (fs.existsSync(wildcardRedirectSource)) {
    const wildcardDir = path.join(ASTRO_GENERATED, 'src', 'pages', 'wildcard');
    if (!fs.existsSync(wildcardDir)) {
      fs.mkdirSync(wildcardDir, { recursive: true });
    }
    const wildcardRedirectDest = path.join(wildcardDir, 'index.astro');
    
    // Create an Astro redirect component
    const redirectTemplate = `---
// Redirect from /wildcard/ to /projects/wildcard
return Astro.redirect("/projects/wildcard", 301);
---`;
    
    fs.writeFileSync(wildcardRedirectDest, redirectTemplate);
    addInfo('✅ Created wildcard redirect at /wildcard/ -> /projects/wildcard');
  }

  // Copy content config
  const configTemplate = readTemplate('config/content-config.ts');
  fs.writeFileSync(path.join(contentDir, 'config.ts'), configTemplate);

  addInfo('✅ Content collections set up successfully');
}

/**
 * Stage 4: Add Blog Listing
 */
async function addBlogListing() {
  addInfo('📝 Adding blog listing...');
  
  // Create blog post layout
  const blogLayoutTemplate = readTemplate('layouts/BlogPostLayout.astro');
  const layoutsDir = path.join(ASTRO_GENERATED, 'src', 'layouts');
  fs.writeFileSync(path.join(layoutsDir, 'BlogPostLayout.astro'), blogLayoutTemplate);

  // Create blog archive page
  const blogTemplate = readTemplate('pages/blog.astro');
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  fs.writeFileSync(path.join(pagesDir, 'blog.astro'), blogTemplate);

  // Update configuration files to support content collections
  addInfo('⚙️  Updating Astro configuration...');
  const astroConfigTemplate = readTemplate('config/astro.config.mjs');
  fs.writeFileSync(path.join(ASTRO_GENERATED, 'astro.config.mjs'), astroConfigTemplate);

  // Update homepage to show blog posts
  addInfo('📝 Adding blog posts to homepage...');
  const homepageWithBlog = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

// Get blog posts and filter out hidden ones
const allPosts = await getCollection('posts');
const visiblePosts = allPosts
  .filter(post => !post.data.hidden)
  .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
---

<BaseLayout title="Geoffrey Litt">
  <div class="home-body-text">
    <p>
      Welcome! I work on <em>malleable software</em>: computing environments where anyone can adapt their software to meet their needs with minimal friction. To see what that means to me, read <a href="https://www.inkandswitch.com/essay/malleable-software/">this essay</a> or listen to <a href="https://jacksondahl.com/dialectic/geoffrey-litt">this interview</a>.
    </p>

    <p>
      I'm also tinkering with AI-assisted programming, which I think can help usher in a <a href="/2023/03/25/llm-end-user-programming.html">new era of personal software tools</a>, help programmers <a href="/2024/12/22/making-programming-more-fun-with-an-ai-generated-debugger.html">have more fun</a>, and <a href="/2023/07/25/building-personal-tools-on-the-fly-with-llms.html">create new interaction patterns</a> for working with software.
    </p>

    <p>
      I'm currently a senior researcher at the independent research lab <a href="https://www.inkandswitch.com/">Ink & Switch</a>. Previously I did a PhD in HCI at MIT—researching end-user programming interfaces, advised by <a href="http://people.csail.mit.edu/dnj/">Daniel Jackson</a>. Earlier in my career I did design and engineering at <a href="https://www.panoramaed.com/">startups</a>. My core skill is designing and prototyping environments for thinking.
    </p>

    <p>
      You can reach me via <a href="mailto:gklitt@gmail.com">email</a>. I enjoy hearing from people making cool stuff! I also do a bit of startup advising for companies related to my work.
    </p>

    <p>
      If you'd like to hear occasional updates on my work, you can <a href="https://buttondown.email/geoffreylitt">subscribe to my email newsletter</a> or <a href="/feed.xml">follow via RSS</a>.
    </p>
  </div>

  <a id="writing"></a>
  <h2 class="project-category">Writing</h2>

  <div class="blogposts-list">
    {visiblePosts.map((post) => {
      // Generate URL matching the [slug].astro pattern
      const match = post.slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)html$/);
      let postUrl;
      if (match) {
        const [_, year, month, day, title] = match;
        postUrl = \`/\${year}/\${month}/\${day}/\${title}/\`;
      } else {
        postUrl = \`/\${post.slug.replace(/html$/, '')}/\`;
      }
      
      return (
        <div class="blogpost-link">
          {post.data.starred ? (
            <a href={postUrl} class="starred">{post.data.title}</a>
          ) : (
            <a href={postUrl}>{post.data.title}</a>
          )}
        </div>
      );
    })}
  </div>

  <a id="contact"></a>
  <h2 class="project-category">Contact me</h2>
  <div class="home-body-text">
    <p>
      <strong>Please reach out</strong> if you're interested in chatting about ideas, or if I might be able to help you in some way. You can contact me via <a href="mailto:gklitt@gmail.com">email</a> or on <a href="http://www.twitter.com/geoffreylitt">Twitter</a>.
    </p>
  </div>
</BaseLayout>`;
  
  fs.writeFileSync(path.join(pagesDir, 'index.astro'), homepageWithBlog);

  addInfo('✅ Blog listing added to homepage');
}

/**
 * Stage 5: Add Project Grids
 */
async function addProjectGrids() {
  addInfo('🗂️  Adding project grids...');
  
  // Copy data files first
  const dataDir = path.join(ASTRO_GENERATED, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataSource = 'data';
  if (fs.existsSync(dataSource)) {
    addInfo('Copying data files...');
    await execSync(`cp -r "${dataSource}"/* "${dataDir}"/`);
  }

  // Create ProjectGrid component
  const componentsDir = path.join(ASTRO_GENERATED, 'src', 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  const projectGridTemplate = readTemplate('components/ProjectGrid.astro');
  fs.writeFileSync(path.join(componentsDir, 'ProjectGrid.astro'), projectGridTemplate);

  // Create projects pages directory
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');
  const projectsPagesDir = path.join(pagesDir, 'projects');
  if (!fs.existsSync(projectsPagesDir)) {
    fs.mkdirSync(projectsPagesDir, { recursive: true });
  }

  const projectSlugTemplate = readTemplate('pages/projects/slug.astro');
  fs.writeFileSync(path.join(projectsPagesDir, '[slug].astro'), projectSlugTemplate);

  // Update homepage with full project showcase
  addInfo('📝 Adding project showcase to homepage...');
  const fullHomepage = readTemplate('pages/index.astro');
  fs.writeFileSync(path.join(pagesDir, 'index.astro'), fullHomepage);

  addInfo('✅ Project grids added successfully');
}

/**
 * Stage 6: Add Special Pages & Polish
 */
async function addSpecialPagesAndPolish() {
  addInfo('📑 Adding special pages and polish...');
  
  const pagesDir = path.join(ASTRO_GENERATED, 'src', 'pages');

  // Add RSS feed
  const feedTemplate = readTemplate('pages/feed.xml.ts');
  fs.writeFileSync(path.join(pagesDir, 'feed.xml.ts'), feedTemplate);

  // Add 404 page
  const notFoundTemplate = readTemplate('pages/404.astro');
  fs.writeFileSync(path.join(pagesDir, '404.astro'), notFoundTemplate);

  // Add dynamic routing for blog posts and pages
  const slugTemplate = readTemplate('pages/slug.astro');
  fs.writeFileSync(path.join(pagesDir, '[...slug].astro'), slugTemplate);

  addInfo('✅ Special pages and polish added successfully');
}

/**
 * Run the complete port process headlessly
 */
async function runCompletePort() {
  console.log('🚀 Starting complete headless port...');
  
  try {
    await initializeBasicSite();
    await addCoreStyling();
    await setupContentCollections();
    await addBlogListing();
    await addProjectGrids();
    await addSpecialPagesAndPolish();
    
    console.log('✅ Port completed successfully!');
    console.log('💡 Next steps:');
    console.log('   cd astro-port-generated');
    console.log('   npm run build');
  } catch (error) {
    console.error('❌ Port failed:', error);
    process.exit(1);
  }
}

module.exports = {
  initializeBasicSite,
  addCoreStyling,
  setupContentCollections,
  addBlogListing,
  addProjectGrids,
  addSpecialPagesAndPolish,
  setCommandExecutor,
  readTemplate,
  transformContentFile,
  runCompletePort
};