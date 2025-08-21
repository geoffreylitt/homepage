/**
 * Port Mapping Utility
 * 
 * Handles mapping between Middleman source files and their corresponding
 * Astro equivalents. Uses fuzzy matching and predefined patterns.
 */

import { CorrespondingFile, FileNode } from '../types';

interface MappingPattern {
  from: RegExp;
  to: string;
  type: string;
}

// Predefined mapping patterns based on the port generator logic
const MAPPING_PATTERNS: MappingPattern[] = [
  // Blog posts
  {
    from: /^articles\/(.+)\.html\.md$/,
    to: 'src/content/posts/$1.html.md',
    type: 'blog_post'
  },
  
  // Project pages
  {
    from: /^projects\/(.+)\.html\.md$/,
    to: 'src/content/projects/$1.html.md',
    type: 'project'
  },
  
  // Special pages
  {
    from: /^inspirations\.html\.md$/,
    to: 'src/pages/inspirations.astro',
    type: 'page'
  },
  {
    from: /^wildcard\/index\.html\.md$/,
    to: 'src/pages/wildcard.astro',
    type: 'page'
  },
  
  // Main pages
  {
    from: /^index\.html\.haml$/,
    to: 'src/pages/index.astro',
    type: 'page'
  },
  {
    from: /^blog\.html\.haml$/,
    to: 'src/pages/blog.astro',
    type: 'page'
  },
  
  // Layout files
  {
    from: /^layouts\/(.+)\.html\.haml$/,
    to: 'src/layouts/$1.astro',
    type: 'layout'
  },
  
  // Static assets
  {
    from: /^images\/(.+)$/,
    to: 'public/images/$1',
    type: 'asset'
  },
  {
    from: /^stylesheets\/(.+)$/,
    to: 'src/styles/$1',
    type: 'style'
  },
  {
    from: /^javascripts\/(.+)$/,
    to: 'public/javascripts/$1',
    type: 'script'
  },
  
  // Resources
  {
    from: /^resources\/(.+)$/,
    to: 'public/resources/$1',
    type: 'resource'
  }
];

/**
 * Find the corresponding file in the other codebase
 * @param filePath - File path in source codebase
 * @param direction - 'middleman-to-astro' or 'astro-to-middleman'
 * @param targetFiles - List of files in target codebase
 * @returns Mapping result or null if no match
 */
function findCorrespondingFile(filePath: string, direction: string, targetFiles: FileNode[] = []): CorrespondingFile | null {
  // Try exact pattern matching first
  const exactMatch = findExactMapping(filePath, direction);
  if (exactMatch) {
    // Verify the target file exists
    if (targetFiles.length === 0 || targetFiles.some(f => f.path === exactMatch.targetPath)) {
      return {
        sourcePath: filePath,
        targetPath: exactMatch.targetPath,
        confidence: 1.0,
        type: exactMatch.type,
        method: 'exact_pattern'
      };
    }
  }

  // Try fuzzy matching based on filename similarity
  const fuzzyMatches = findFuzzyMatches(filePath, direction, targetFiles);
  if (fuzzyMatches.length > 0) {
    return fuzzyMatches[0]; // Return best match
  }

  return null;
}

/**
 * Find exact mapping using predefined patterns
 */
function findExactMapping(filePath: string, direction: string): { targetPath: string; type: string } | null {
  for (const pattern of MAPPING_PATTERNS) {
    if (direction === 'middleman-to-astro') {
      const match = filePath.match(pattern.from);
      if (match) {
        const targetPath = pattern.to.replace(/\$(\d+)/g, (_, index) => match[parseInt(index)]);
        return {
          targetPath,
          type: pattern.type
        };
      }
    } else if (direction === 'astro-to-middleman') {
      // Reverse mapping - check if the file path matches the 'to' pattern
      const reversePattern = createReversePattern(pattern.to);
      const match = filePath.match(reversePattern);
      if (match) {
        const targetPath = pattern.from.source.replace(/\\\$(\d+)/g, (_, index) => match[parseInt(index)]);
        return {
          targetPath: targetPath.replace(/[\^\$\(\)\[\]\.]/g, ''), // Clean up regex chars
          type: pattern.type
        };
      }
    }
  }
  return null;
}

/**
 * Find fuzzy matches based on filename similarity
 */
function findFuzzyMatches(filePath: string, direction: string, targetFiles: FileNode[]): CorrespondingFile[] {
  if (targetFiles.length === 0) return [];

  const fileName = extractFileName(filePath);
  const matches: CorrespondingFile[] = [];

  for (const targetFile of targetFiles) {
    const targetFileName = extractFileName(targetFile.path);
    const similarity = calculateSimilarity(fileName, targetFileName);
    
    if (similarity > 0.3) { // Minimum similarity threshold
      matches.push({
        sourcePath: filePath,
        targetPath: targetFile.path,
        confidence: similarity,
        type: 'unknown',
        method: 'fuzzy_filename'
      });
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract the base filename without extension and path
 */
function extractFileName(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.(html\.md|astro|haml|md|js|css|scss)$/, '');
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Create a reverse regex pattern for astro-to-middleman mapping
 */
function createReversePattern(toPattern: string): RegExp {
  // Convert pattern like 'src/content/posts/$1.html.md' to a regex
  // This is a simplified implementation
  const escaped = toPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withCapture = escaped.replace(/\\\$(\d+)/g, '(.+)');
  return new RegExp(`^${withCapture}$`);
}

/**
 * Get all possible mappings for a file (for debugging/info)
 */
function getAllMappings(filePath: string, direction: string, targetFiles: FileNode[] = []): CorrespondingFile[] {
  const mappings: CorrespondingFile[] = [];
  
  // Add exact mapping if found
  const exactMapping = findExactMapping(filePath, direction);
  if (exactMapping) {
    mappings.push({
      ...exactMapping,
      sourcePath: filePath,
      confidence: 1.0,
      method: 'exact_pattern'
    });
  }
  
  // Add fuzzy mappings
  const fuzzyMappings = findFuzzyMatches(filePath, direction, targetFiles);
  mappings.push(...fuzzyMappings);
  
  return mappings;
}

export {
  findCorrespondingFile,
  getAllMappings,
  MAPPING_PATTERNS
};