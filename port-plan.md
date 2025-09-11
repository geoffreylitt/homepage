# Middleman to Astro Migration Plan

## Overview

This document tracks the step-by-step migration of Geoffrey Litt's personal website from Middleman to Astro. The goal is to match the original HTML/CSS output as closely as possible while creating a clean, modern Astro codebase.

## Verification Script

The `compare-builds.js` script provides a token-efficient comparison between the Middleman and Astro builds:

```bash
node compare-builds.js
```

**What it shows:**
- File count comparison (Middleman vs Astro vs Common)
- Missing files by type (HTML, CSS, JS, Other)  
- Content differences for shared files
- Status of key pages (index, blog, feed, 404, sample posts)

**Key metrics to watch:**
- **Total files**: Should approach 327 (Middleman target)
- **Missing HTML pages**: Should decrease as we port each content type
- **Key pages status**: ✓ means page exists in both builds

## Migration Stages

### Stage 1: Copy Static Assets ✅ COMPLETE
**Goal:** Get all images, CSS, JS, and static files into Astro

**Actions taken:**
- `cp -r source/images astro-port/public/`
- `cp -r source/stylesheets astro-port/public/`  
- `cp -r source/javascripts astro-port/public/`
- `cp -r aoc2023 astro-port/public/`
- `cp -r source/margin-notes astro-port/public/`
- `cp -r source/wildcard astro-port/public/`
- `cp -r source/resources astro-port/public/`
- Copied individual files: resume.pdf, robots.txt, etc.

**Verification result:** 275 static assets successfully copied

### Stage 2: Set up Content Collections ✅ COMPLETE  
**Goal:** Prepare Astro to handle blog posts and projects

**Actions taken:**
- Created `src/content/posts/` and `src/content/projects/`
- Copied all `.md` files with `cp` commands
- Created content collection schema in `src/content/config.ts`
- Fixed schema validation issues (nullable tags, legacy collections)

**Verification result:** Content ready but not yet rendered in build

### Stage 3: Create Layouts ✅ COMPLETE
**Goal:** Port HAML layouts to Astro components  

**Actions taken:**
- Created `BaseLayout.astro` from `layout.haml` (header, nav, footer, scripts)
- Created `BlogPostLayout.astro` from `blogpost.haml` + `simple.haml`
- Added `is:inline` directives for external scripts
- Set up SCSS compilation (source files, not pre-built CSS)

**Verification result:** Layouts ready for use

### Stage 4: Port Home Page ✅ COMPLETE
**Goal:** Get index.html working with real content

**Actions taken:**
- Created `src/pages/index.astro` from `index.html.haml`
- Created `ProjectGrid.astro` component from `_project_grid.haml`
- Imported YAML data files with fs/yaml parsing
- Fixed all image path issues (relative → absolute paths)
- Enabled real blog posts collection (not test data)

**Verification result:** Home page fully functional with styling

### Stage 5: Blog Post Pages ✅ COMPLETE
**Goal:** Generate individual pages for all blog posts

**Actions taken:**
- Created `src/pages/[...slug].astro` with dynamic routing
- Set up `getStaticPaths()` to generate date-based URLs (e.g., `/2025/07/27/title/`) 
- Fixed content collection image processing issues
- Removed problematic `layout:` fields from markdown frontmatter
- Used `BlogPostLayout` for consistent post rendering

**Verification result:** 32 pages built (1 home + 31 blog posts)

### Stage 6: Project Pages 🚧 TODO
**Goal:** Generate individual pages for all project descriptions

**Planned actions:**
- Create `src/pages/projects/[slug].astro`
- Generate from project markdown files in `src/content/projects/`
- Use appropriate layout (likely similar to blog posts but simpler)

**Expected verification:** ~45 total pages (current 32 + ~13 project pages)

### Stage 7: Blog Index & Other Pages 🚧 TODO  
**Goal:** Add remaining static pages

**Planned actions:**
- Create `src/pages/blog.astro` from `blog.html.haml`
- Create `src/pages/404.astro` from `404.html`
- Port `src/pages/inspirations.md` from `inspirations.html.md`

**Expected verification:** ~48 total pages

### Stage 8: RSS Feed 🚧 TODO
**Goal:** Generate RSS feed matching original

**Planned actions:**
- Install `@astrojs/rss`
- Create `src/pages/feed.xml.ts` 
- Match existing feed structure and content

**Expected verification:** feed.xml present and matching

### Stage 9: URL Redirects & Final Polish 🚧 TODO
**Goal:** Ensure no broken links and perfect compatibility

**Planned actions:**
- Set up 301 redirects for old date-based URLs → new URLs
- Add any missing `.htaccess` rules or hosting config
- Final verification of all content and styling
- Performance optimization

## Current Status (as of latest commit)

### ✅ What's Working
- **Home page**: Full content, styling, project grids, real blog post list
- **All static assets**: Images, CSS, JS, PDFs all accessible
- **SCSS compilation**: Using source files, not pre-built CSS  
- **31 blog post pages**: All posts individually accessible with proper layouts
- **Content collections**: Posts and projects loading correctly
- **Layouts**: Header, nav, footer, styling all working

### 🚧 What's Missing
- **Project pages**: Individual project detail pages (~13 pages)
- **Blog index page**: `/blog.html` listing all posts
- **404 page**: Error page  
- **RSS feed**: `/feed.xml`
- **Inspirations page**: Static markdown page
- **URL redirects**: For SEO/backward compatibility

### 🔍 Current Build Stats
```
Middleman files: 327
Astro files:     286  
Common files:    275
Missing HTML:    48 pages (mostly projects + static pages)
```

### 🎯 Key Pages Status
- ✅ index.html (home page)
- ✅ All blog posts (31 pages)
- ❌ blog.html (blog index)
- ❌ feed.xml (RSS feed)  
- ❌ 404.html (error page)
- ❌ projects/* (individual project pages)

## Next Steps

1. **Continue with Stage 6**: Implement project pages
2. **Run verification** after each stage to track progress  
3. **Stage 7**: Add blog index and other static pages
4. **Stage 8**: Implement RSS feed
5. **Stage 9**: Set up redirects and final polish

## Notes & Lessons Learned

- **Image paths**: Astro content collections require absolute paths (`/images/...`) not relative (`images/...`)
- **Legacy collections**: Needed for layout field support in frontmatter
- **Script tags**: External scripts need `is:inline` directive
- **SCSS**: Better to use source files + Astro compilation than pre-built CSS
- **URL structure**: Preserved original date-based blog post URLs for SEO

## Development Commands

```bash
# Run dev server
cd astro-port && npm run dev

# Build for production  
cd astro-port && npm run build

# Run verification
node compare-builds.js

# Check git status
git status
```