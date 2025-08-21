import React, { useEffect, useRef } from 'react';
import { CodeViewerProps } from '../types';

// Import Prism.js for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css'; // Dark theme that fits our aesthetic

// Import common language components
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-haml';

const CodeViewer: React.FC<CodeViewerProps> = ({ content, filePath, extension }) => {
  const codeRef = useRef<HTMLElement>(null);

  // Map file extensions to Prism language identifiers
  const getLanguage = (ext: string): string => {
    const extensionMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'jsx',
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'scss',
      '.md': 'markdown',
      '.markdown': 'markdown',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.rb': 'ruby',
      '.haml': 'haml',
      '.html': 'html',
      '.htm': 'html',
      '.astro': 'jsx', // Treat Astro files as JSX for highlighting
      '.mjs': 'javascript'
    };
    
    return extensionMap[ext] || 'text';
  };

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [content, extension]);

  const language = getLanguage(extension);
  const lines = content ? content.split('\n') : [];

  // For very large files, show a warning
  if (lines.length > 1000) {
    return (
      <div className="p-4 text-center">
        <div className="text-cockpit-amber mb-2">⚠️</div>
        <div className="text-sm text-cockpit-text mb-2">
          File is too large to display ({lines.length} lines)
        </div>
        <div className="text-xs text-cockpit-muted">
          Files with more than 1000 lines are not shown for performance reasons
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-4 text-center text-xs text-cockpit-muted">
        No content to display
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-cockpit-bg">
      {/* File Info Header */}
      <div className="p-2 border-b border-cockpit-border bg-cockpit-panel">
        <div className="flex items-center justify-between text-xs">
          <div className="text-cockpit-text font-mono truncate">
            {filePath}
          </div>
          <div className="text-cockpit-muted">
            {lines.length} line{lines.length !== 1 ? 's' : ''} • {language}
          </div>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-bloomberg-panel px-2 py-2 text-bloomberg-muted font-terminal text-terminal leading-relaxed border-r border-bloomberg-border">
            {lines.map((_, index) => (
              <div key={index} className="text-right pr-2">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code */}
          <div className="flex-1 overflow-auto">
            <pre className="p-2 font-terminal text-terminal leading-relaxed">
              <code
                ref={codeRef}
                className={`language-${language}`}
                style={{
                  background: 'transparent',
                  color: '#e5e5e5',
                  fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace'
                }}
              >
                {content}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer with file stats */}
      <div className="p-2 border-t border-cockpit-border bg-cockpit-panel">
        <div className="text-xs text-cockpit-muted">
          Size: {new Blob([content]).size} bytes
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;