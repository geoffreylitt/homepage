/**
 * Frontend utility for file matching and correspondence
 * Works with the backend port mapping logic
 */

// Simple mapping patterns for quick client-side matching
const QUICK_PATTERNS = [
  // Blog posts
  { from: /^articles\/(.+)\.html\.md$/, to: 'src/content/posts/$1.html.md' },
  
  // Project pages  
  { from: /^projects\/(.+)\.html\.md$/, to: 'src/content/projects/$1.html.md' },
  
  // Special pages
  { from: /^inspirations\.html\.md$/, to: 'src/pages/inspirations.astro' },
  { from: /^wildcard\/index\.html\.md$/, to: 'src/pages/wildcard.astro' },
  
  // Main pages
  { from: /^index\.html\.haml$/, to: 'src/pages/index.astro' },
  { from: /^blog\.html\.haml$/, to: 'src/pages/blog.astro' },
  
  // Assets
  { from: /^images\/(.+)$/, to: 'public/images/$1' },
  { from: /^stylesheets\/(.+)$/, to: 'src/styles/$1' }
];

/**
 * Find corresponding file using quick pattern matching
 * @param {string} filePath - Source file path
 * @param {string} direction - 'middleman-to-astro' or 'astro-to-middleman'
 * @returns {string|null} Corresponding file path or null
 */
export const findCorrespondingFile = (filePath, direction = 'middleman-to-astro') => {
  if (direction === 'middleman-to-astro') {
    for (const pattern of QUICK_PATTERNS) {
      const match = filePath.match(pattern.from);
      if (match) {
        return pattern.to.replace(/\$(\d+)/g, (_, index) => match[parseInt(index)]);
      }
    }
  } else {
    // Reverse mapping for astro-to-middleman
    for (const pattern of QUICK_PATTERNS) {
      const reversePattern = createReversePattern(pattern.to);
      const match = filePath.match(reversePattern);
      if (match) {
        const sourcePath = pattern.from.source.replace(/\\\$(\d+)/g, (_, index) => match[parseInt(index)]);
        return sourcePath.replace(/[\^\$\(\)\[\]\.]/g, ''); // Clean up regex chars
      }
    }
  }
  
  return null;
};

/**
 * Check if two files are likely related based on filename similarity
 * @param {string} file1 - First file path
 * @param {string} file2 - Second file path
 * @returns {number} Similarity score (0-1)
 */
export const calculateFileSimilarity = (file1, file2) => {
  const name1 = extractFileName(file1);
  const name2 = extractFileName(file2);
  
  if (name1 === name2) return 1.0;
  
  return calculateSimilarity(name1, name2);
};

/**
 * Get the base filename without extension and path
 * @param {string} filePath - File path
 * @returns {string} Base filename
 */
export const extractFileName = (filePath) => {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.(html\.md|astro|haml|md|js|css|scss)$/, '');
};

/**
 * Find best matching files from a list
 * @param {string} sourceFile - Source file to match
 * @param {Array} targetFiles - List of target files
 * @param {string} direction - Mapping direction
 * @returns {Array} Sorted list of matches with scores
 */
export const findBestMatches = (sourceFile, targetFiles, direction = 'middleman-to-astro') => {
  const matches = [];
  
  // First try exact pattern matching
  const exactMatch = findCorrespondingFile(sourceFile, direction);
  if (exactMatch) {
    const targetFile = targetFiles.find(f => f.path === exactMatch);
    if (targetFile) {
      matches.push({
        file: targetFile,
        score: 1.0,
        type: 'exact'
      });
    }
  }
  
  // Then try similarity matching
  for (const targetFile of targetFiles) {
    if (targetFile.type === 'file') {
      const similarity = calculateFileSimilarity(sourceFile, targetFile.path);
      if (similarity > 0.3) { // Minimum threshold
        matches.push({
          file: targetFile,
          score: similarity,
          type: 'similar'
        });
      }
    }
  }
  
  // Sort by score (highest first) and remove duplicates
  return matches
    .sort((a, b) => b.score - a.score)
    .filter((match, index, arr) => 
      index === 0 || arr[index - 1].file.path !== match.file.path
    );
};

/**
 * Create a reverse regex pattern
 * @param {string} toPattern - Forward pattern
 * @returns {RegExp} Reverse pattern
 */
function createReversePattern(toPattern) {
  const escaped = toPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withCapture = escaped.replace(/\\\$(\d+)/g, '(.+)');
  return new RegExp(`^${withCapture}$`);
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string  
 * @returns {number} Similarity (0-1)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
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