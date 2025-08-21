import { JSDOM } from 'jsdom';
import { minify } from 'html-minifier-terser';

export interface NormalizationOptions {
  removeAssetVersions: boolean;
  normalizeCSSOrder: boolean;
  minifyHTML: boolean;
}

export const DEFAULT_NORMALIZATION_OPTIONS: NormalizationOptions = {
  removeAssetVersions: false,
  normalizeCSSOrder: false,
  minifyHTML: false,
};

/**
 * Normalizes HTML to remove cosmetic differences that don't affect browser rendering
 */
export async function normalizeHTML(html: string, options: NormalizationOptions = DEFAULT_NORMALIZATION_OPTIONS): Promise<string> {
  try {
    let normalizedHTML = html;

    // 1. Basic text normalization first
    normalizedHTML = normalizedHTML
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize quotes in attributes (single to double)
      .replace(/([a-zA-Z-]+)='([^']*)'/g, '$1="$2"')
      // Normalize whitespace around = in attributes
      .replace(/\s*=\s*/g, '=');

    // 2. Optional: Remove asset versioning
    if (options.removeAssetVersions) {
      normalizedHTML = normalizedHTML
        .replace(/(href|src)="([^"]+)\?[^"]*"/g, '$1="$2"');
    }

    // 3. Parse with jsdom for structural normalization
    const dom = new JSDOM(normalizedHTML);
    const document = dom.window.document;
    
    // 4. Normalize attribute order
    normalizeAttributeOrder(document);
    
    // 5. Normalize empty attributes
    normalizeEmptyAttributes(document);
    
    // 6. Optional: Normalize CSS link order
    if (options.normalizeCSSOrder) {
      normalizeCSSLinkOrder(document);
    }
    
    // Get the normalized HTML
    normalizedHTML = document.documentElement.outerHTML;
    
    // 7. Optional: Minify HTML
    if (options.minifyHTML) {
      normalizedHTML = await minify(normalizedHTML, {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: false,
        sortAttributes: true,
        sortClassName: true,
        caseSensitive: true,
      });
    } else {
      // Apply light formatting for consistent comparison
      normalizedHTML = formatHTML(normalizedHTML);
    }
    
    return normalizedHTML;
  } catch (error) {
    console.error('HTML normalization failed:', error);
    // Return original HTML if normalization fails
    return html;
  }
}

/**
 * Convert single quotes to double quotes in attributes
 */
function normalizeAttributeQuotes(document: Document): void {
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      // The browser already normalizes quotes when we access via DOM
      // but we need to ensure consistent serialization
      if (attr.value !== null) {
        element.setAttribute(attr.name, attr.value);
      }
    });
  });
}

/**
 * Normalize attribute order alphabetically
 */
function normalizeAttributeOrder(document: Document): void {
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const attributes = Array.from(element.attributes);
    
    // Sort attributes alphabetically by name
    attributes.sort((a, b) => a.name.localeCompare(b.name));
    
    // Remove all attributes
    attributes.forEach(attr => element.removeAttribute(attr.name));
    
    // Re-add in sorted order
    attributes.forEach(attr => {
      element.setAttribute(attr.name, attr.value);
    });
  });
}

/**
 * Normalize empty attributes to consistent format
 */
function normalizeEmptyAttributes(document: Document): void {
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      // Convert empty string attributes to consistent format
      if (attr.value === '') {
        element.setAttribute(attr.name, '');
      }
    });
  });
}

/**
 * Remove cache-busting query parameters from asset URLs
 */
function removeAssetVersioning(document: Document): void {
  // Remove versioning from script src attributes
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      const cleanSrc = src.split('?')[0];
      script.setAttribute('src', cleanSrc);
    }
  });
  
  // Remove versioning from link href attributes
  const links = document.querySelectorAll('link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const cleanHref = href.split('?')[0];
      link.setAttribute('href', cleanHref);
    }
  });
  
  // Remove versioning from img src attributes
  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      const cleanSrc = src.split('?')[0];
      img.setAttribute('src', cleanSrc);
    }
  });
}

/**
 * Normalize CSS link order in head
 */
function normalizeCSSLinkOrder(document: Document): void {
  const head = document.querySelector('head');
  if (!head) return;
  
  // Find all CSS link elements
  const cssLinks = Array.from(head.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]'));
  
  if (cssLinks.length <= 1) return;
  
  // Sort by href attribute
  cssLinks.sort((a, b) => {
    const hrefA = a.getAttribute('href') || '';
    const hrefB = b.getAttribute('href') || '';
    return hrefA.localeCompare(hrefB);
  });
  
  // Find the first CSS link as insertion point
  const firstLink = head.querySelector('link[rel="stylesheet"], link[type="text/css"]');
  if (!firstLink) return;
  
  // Remove all CSS links from their current positions
  cssLinks.forEach(link => link.remove());
  
  // Insert sorted links at the original position of the first link
  let insertBefore = firstLink.nextSibling;
  cssLinks.forEach(link => {
    head.insertBefore(link, insertBefore);
  });
}

/**
 * Format HTML consistently for comparison
 */
function formatHTML(html: string): string {
  return html
    // Just normalize basic whitespace issues
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove trailing whitespace from lines
    .replace(/[ \t]+$/gm, '')
    // Normalize multiple spaces/tabs to single space within lines (but preserve structure)
    .replace(/[ \t]+/g, ' ')
    // Clean up extra empty lines
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

/**
 * Compare two HTML strings after normalization
 */
export async function compareHTML(
  html1: string,
  html2: string,
  options: NormalizationOptions = DEFAULT_NORMALIZATION_OPTIONS
): Promise<{ identical: boolean; normalizedHtml1: string; normalizedHtml2: string }> {
  const normalizedHtml1 = await normalizeHTML(html1, options);
  const normalizedHtml2 = await normalizeHTML(html2, options);
  
  return {
    identical: normalizedHtml1 === normalizedHtml2,
    normalizedHtml1,
    normalizedHtml2,
  };
}