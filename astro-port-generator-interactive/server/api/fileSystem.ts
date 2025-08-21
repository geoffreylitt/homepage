import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { FileNode, FileContent, FileChange, PathConfig } from '../types';

const router = express.Router();

// Configuration for which files/directories to show
const MIDDLEMAN_PATHS: PathConfig = {
  root: '../../../source',
  include: ['articles', 'projects', 'images', 'stylesheets', 'javascripts', '*.html.haml', '*.html.md', '*.rb'],
  exclude: ['node_modules', '.git', '.DS_Store', 'build', 'tmp']
};

const ASTRO_PATHS: PathConfig = {
  root: '../astro-port-generated',
  include: ['src', 'public', 'dist', '*.astro', '*.mjs', '*.json', '*.ts'],
  exclude: ['node_modules', '.git', '.DS_Store', 'build', 'tmp']
};

// GET /api/filesystem/tree/:site - Get file tree for a site
router.get('/tree/:site', async (req, res) => {
  const { site } = req.params;
  
  try {
    let config;
    if (site === 'middleman') {
      config = MIDDLEMAN_PATHS;
    } else if (site === 'astro') {
      config = ASTRO_PATHS;
    } else {
      return res.status(400).json({ error: 'Invalid site. Use "middleman" or "astro"' });
    }

    const rootPath = path.resolve(config.root);
    
    if (!await fs.pathExists(rootPath)) {
      return res.json({ 
        tree: null, 
        error: `Path not found: ${rootPath}`,
        exists: false 
      });
    }

    const tree = await buildFileTree(rootPath, config);
    
    res.json({
      tree,
      exists: true,
      rootPath
    });

  } catch (error) {
    console.error('Error building file tree:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/filesystem/content - Get file content
router.get('/content', async (req, res) => {
  const { site, filePath } = req.query as { site: string; filePath: string };
  
  if (!site || !filePath) {
    return res.status(400).json({ error: 'Missing site or filePath parameter' });
  }

  try {
    const config = site === 'middleman' ? MIDDLEMAN_PATHS : ASTRO_PATHS;
    const rootPath = path.resolve(config.root);
    const fullPath = path.resolve(rootPath, filePath);
    
    // Security check: ensure file is within the allowed directory
    if (!fullPath.startsWith(rootPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }

    // Check file size (limit to 1MB for safety)
    if (stats.size > 1024 * 1024) {
      return res.status(413).json({ error: 'File too large' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const extension = path.extname(fullPath);
    
    res.json({
      content,
      path: filePath,
      extension,
      size: stats.size,
      modified: stats.mtime
    });

  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/filesystem/changes - Get recent file changes
router.get('/changes', async (req, res) => {
  const { site, since } = req.query as { site: string; since?: string };
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 5000); // 5 seconds ago
  
  try {
    const config = site === 'middleman' ? MIDDLEMAN_PATHS : ASTRO_PATHS;
    const rootPath = path.resolve(config.root);
    
    if (!await fs.pathExists(rootPath)) {
      return res.json({ changes: [] });
    }

    const changes = await findRecentChanges(rootPath, config, sinceDate);
    
    res.json({
      changes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error finding changes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to build file tree
async function buildFileTree(rootPath: string, config: PathConfig, relativePath: string = ''): Promise<FileNode[]> {
  const entries = await fs.readdir(path.join(rootPath, relativePath));
  const tree: FileNode[] = [];

  for (const entry of entries) {
    const entryPath = path.join(relativePath, entry);
    const fullPath = path.join(rootPath, entryPath);
    
    // Skip excluded files/directories
    if (shouldExclude(entry, config.exclude)) {
      continue;
    }

    try {
      const stats = await fs.stat(fullPath);
      const isDirectory = stats.isDirectory();
      
      const node: FileNode = {
        name: entry,
        path: entryPath,
        type: isDirectory ? 'directory' : 'file',
        size: isDirectory ? undefined : stats.size,
        modified: stats.mtime
      };

      // For directories, recursively build children (limit depth to prevent performance issues)
      if (isDirectory && relativePath.split('/').length < 4) {
        node.children = await buildFileTree(rootPath, config, entryPath);
      }

      tree.push(node);
    } catch (error) {
      // Skip files we can't access
      console.warn(`Cannot access ${entryPath}:`, error.message);
    }
  }

  return tree.sort((a, b) => {
    // Directories first, then files, both alphabetically
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// Helper function to check if file should be excluded
function shouldExclude(filename: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      // Simple glob pattern matching
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    }
    return filename === pattern || filename.startsWith(pattern);
  });
}

// Helper function to find recent changes
async function findRecentChanges(rootPath: string, config: PathConfig, sinceDate: Date, changes: FileChange[] = [], relativePath: string = ''): Promise<FileChange[]> {
  try {
    const entries = await fs.readdir(path.join(rootPath, relativePath));
    
    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry);
      const fullPath = path.join(rootPath, entryPath);
      
      if (shouldExclude(entry, config.exclude)) {
        continue;
      }

      const stats = await fs.stat(fullPath);
      
      if (stats.mtime > sinceDate) {
        changes.push({
          path: entryPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          action: 'modified',
          timestamp: stats.mtime
        });
      }

      // Recursively check directories (limit depth)
      if (stats.isDirectory() && relativePath.split('/').length < 3) {
        await findRecentChanges(rootPath, config, sinceDate, changes, entryPath);
      }
    }
  } catch (error) {
    // Skip directories we can't access
  }
  
  return changes;
}

export default router;