import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { createTwoFilesPatch } from 'diff';
import { normalizeHTML, compareHTML, NormalizationOptions, DEFAULT_NORMALIZATION_OPTIONS } from '../utils/htmlNormalizer';

const router = express.Router();

// Configuration for HTML file paths
const MIDDLEMAN_BUILD_PATH = '/Users/geoffreylitt/dev/homepage/build';
const ASTRO_BUILD_PATH = '/Users/geoffreylitt/dev/homepage/.conductor/seattle/astro-port-generated/dist';

interface FileComparison {
  relativePath: string;
  status: 'identical' | 'different' | 'missing-middleman' | 'missing-astro';
  diffStats?: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

interface ComparisonResult {
  file: string;
  identical: boolean;
  middlemanContent: string;
  astroContent: string;
  normalizedMiddleman: string;
  normalizedAstro: string;
  diff: string;
  rawDiff: string;
}

// GET /api/audit/files - Get list of all HTML files with comparison status
router.get('/files', async (req, res) => {
  try {
    const { normalize = 'true' } = req.query as { normalize?: string };
    
    const normalizationOptions: NormalizationOptions = {
      removeAssetVersions: req.query.removeAssetVersions === 'true',
      normalizeCSSOrder: req.query.normalizeCSSOrder === 'true',
      minifyHTML: req.query.minifyHTML === 'true',
    };
    
    const shouldNormalize = normalize === 'true';
    
    // Get all HTML files from both directories
    const middlemanFiles = await getHtmlFiles(MIDDLEMAN_BUILD_PATH);
    const astroFiles = await getHtmlFiles(ASTRO_BUILD_PATH);
    
    // Create a set of all unique file paths
    const allFiles = new Set([...middlemanFiles, ...astroFiles]);
    
    const comparisons: FileComparison[] = [];
    
    for (const relativePath of allFiles) {
      const middlemanExists = middlemanFiles.includes(relativePath);
      const astroExists = astroFiles.includes(relativePath);
      
      if (!middlemanExists) {
        comparisons.push({
          relativePath,
          status: 'missing-middleman'
        });
        continue;
      }
      
      if (!astroExists) {
        comparisons.push({
          relativePath,
          status: 'missing-astro'
        });
        continue;
      }
      
      // Compare the files
      const middlemanPath = path.join(MIDDLEMAN_BUILD_PATH, relativePath);
      const astroPath = path.join(ASTRO_BUILD_PATH, relativePath);
      
      try {
        const middlemanContent = await fs.readFile(middlemanPath, 'utf8');
        const astroContent = await fs.readFile(astroPath, 'utf8');
        
        let identical: boolean;
        
        if (shouldNormalize) {
          const comparison = await compareHTML(middlemanContent, astroContent, normalizationOptions);
          identical = comparison.identical;
        } else {
          identical = middlemanContent === astroContent;
        }
        
        comparisons.push({
          relativePath,
          status: identical ? 'identical' : 'different',
        });
      } catch (error) {
        console.error(`Error comparing ${relativePath}:`, error);
        comparisons.push({
          relativePath,
          status: 'different' // Default to different if we can't compare
        });
      }
    }
    
    // Sort by path for consistent ordering
    comparisons.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    
    const stats = {
      total: comparisons.length,
      identical: comparisons.filter(c => c.status === 'identical').length,
      different: comparisons.filter(c => c.status === 'different').length,
      missingMiddleman: comparisons.filter(c => c.status === 'missing-middleman').length,
      missingAstro: comparisons.filter(c => c.status === 'missing-astro').length,
    };
    
    res.json({
      files: comparisons,
      stats,
      normalizationOptions: shouldNormalize ? normalizationOptions : null
    });
    
  } catch (error) {
    console.error('Error listing audit files:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/compare/:filePath - Get detailed comparison for specific file
router.get('/compare/*', async (req, res) => {
  try {
    const filePath = req.params[0]; // Get the full path after /compare/
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const normalizationOptions: NormalizationOptions = {
      removeAssetVersions: req.query.removeAssetVersions === 'true',
      normalizeCSSOrder: req.query.normalizeCSSOrder === 'true',
      minifyHTML: req.query.minifyHTML === 'true',
    };
    
    const middlemanPath = path.join(MIDDLEMAN_BUILD_PATH, filePath);
    const astroPath = path.join(ASTRO_BUILD_PATH, filePath);
    
    // Check if files exist
    const middlemanExists = await fs.pathExists(middlemanPath);
    const astroExists = await fs.pathExists(astroPath);
    
    if (!middlemanExists && !astroExists) {
      return res.status(404).json({ error: 'File not found in either build' });
    }
    
    // Read file contents
    const middlemanContent = middlemanExists ? await fs.readFile(middlemanPath, 'utf8') : '';
    const astroContent = astroExists ? await fs.readFile(astroPath, 'utf8') : '';
    
    // Normalize content
    const normalizedMiddleman = middlemanExists ? await normalizeHTML(middlemanContent, normalizationOptions) : '';
    const normalizedAstro = astroExists ? await normalizeHTML(astroContent, normalizationOptions) : '';
    
    // Generate diffs
    const rawDiff = createTwoFilesPatch(
      `middleman/${filePath}`,
      `astro/${filePath}`,
      middlemanContent,
      astroContent,
      'Middleman Build',
      'Astro Build'
    );
    
    const normalizedDiff = createTwoFilesPatch(
      `middleman/${filePath} (normalized)`,
      `astro/${filePath} (normalized)`,
      normalizedMiddleman,
      normalizedAstro,
      'Middleman Build (normalized)',
      'Astro Build (normalized)'
    );
    
    const identical = normalizedMiddleman === normalizedAstro;
    
    const result: ComparisonResult = {
      file: filePath,
      identical,
      middlemanContent: middlemanExists ? middlemanContent : '',
      astroContent: astroExists ? astroContent : '',
      normalizedMiddleman,
      normalizedAstro,
      diff: normalizedDiff,
      rawDiff,
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('Error comparing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audit/normalize - Normalize HTML content
router.post('/normalize', async (req, res) => {
  try {
    const { html, options = DEFAULT_NORMALIZATION_OPTIONS } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    const normalizedHTML = await normalizeHTML(html, options);
    
    res.json({
      original: html,
      normalized: normalizedHTML,
      options
    });
    
  } catch (error) {
    console.error('Error normalizing HTML:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/build-status - Check if build directories exist
router.get('/build-status', async (req, res) => {
  try {
    console.log('🔍 [Audit] Checking build paths:');
    console.log('  Middleman:', MIDDLEMAN_BUILD_PATH);
    console.log('  Astro:', ASTRO_BUILD_PATH);
    
    const middlemanExists = await fs.pathExists(MIDDLEMAN_BUILD_PATH);
    const astroExists = await fs.pathExists(ASTRO_BUILD_PATH);
    
    console.log('  Middleman exists:', middlemanExists);
    console.log('  Astro exists:', astroExists);
    
    const middlemanStats = middlemanExists ? await fs.stat(MIDDLEMAN_BUILD_PATH) : null;
    const astroStats = astroExists ? await fs.stat(ASTRO_BUILD_PATH) : null;
    
    res.json({
      middleman: {
        exists: middlemanExists,
        path: MIDDLEMAN_BUILD_PATH,
        lastModified: middlemanStats?.mtime || null,
      },
      astro: {
        exists: astroExists,
        path: ASTRO_BUILD_PATH,
        lastModified: astroStats?.mtime || null,
      }
    });
    
  } catch (error) {
    console.error('Error checking build status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Recursively find all HTML files in a directory
 */
async function getHtmlFiles(rootPath: string, currentPath: string = ''): Promise<string[]> {
  const fullPath = path.join(rootPath, currentPath);
  
  if (!await fs.pathExists(fullPath)) {
    return [];
  }
  
  const entries = await fs.readdir(fullPath);
  const htmlFiles: string[] = [];
  
  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry);
    const relativePath = path.join(currentPath, entry);
    
    const stats = await fs.stat(entryPath);
    
    if (stats.isDirectory()) {
      // Skip common build artifact directories
      if (['node_modules', '.git', 'assets', '_astro'].includes(entry)) {
        continue;
      }
      
      // Recursively scan subdirectories
      const subFiles = await getHtmlFiles(rootPath, relativePath);
      htmlFiles.push(...subFiles);
    } else if (entry.endsWith('.html')) {
      htmlFiles.push(relativePath);
    }
  }
  
  return htmlFiles;
}

export default router;