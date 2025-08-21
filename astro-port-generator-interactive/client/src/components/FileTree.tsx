import React, { useState, useEffect } from 'react';

const FileTree = ({ 
  site, 
  onFileClick, 
  selectedFile, 
  linkMode, 
  correspondingFile,
  newFiles = new Set()
}) => {
  console.log(`🌳 [FileTree] Rendering for site: ${site}, newFiles size: ${newFiles.size}`, Array.from(newFiles));
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState(new Set([''])); // Root is expanded by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Load file tree
  useEffect(() => {
    loadFileTree();
  }, [site]);

  // Poll for changes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadFileTree(false); // Silent refresh
    }, 3000);
    
    return () => clearInterval(interval);
  }, [site]);

  const loadFileTree = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/filesystem/tree/${site}`);
      const data = await response.json();
      
      if (data.tree) {
        setTree(data.tree);
        setLastUpdate(Date.now());
      } else {
        setError(data.error || 'No files found');
      }
    } catch (error) {
      console.error('Failed to load file tree:', error);
      setError('Failed to load files');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const toggleExpanded = (path) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return newExpanded;
    });
  };

  // Check if a directory contains any new files (recursively)
  const directoryContainsNewFiles = (node, basePath = '') => {
    if (!node.children) return false;
    
    for (const child of node.children) {
      const childPath = basePath ? `${basePath}/${child.name}` : child.name;
      
      if (child.type === 'file' && newFiles.has(childPath)) {
        return true;
      }
      
      if (child.type === 'directory' && directoryContainsNewFiles(child, childPath)) {
        return true;
      }
    }
    
    return false;
  };

  const renderTreeNode = (node, depth = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;
    const isCorresponding = linkMode && correspondingFile === node.path;
    const isNewFile = newFiles.has(node.path);
    const isDirectoryWithNewFiles = node.type === 'directory' && directoryContainsNewFiles(node);
    
    if (isNewFile || isDirectoryWithNewFiles) {
      console.log(`🟢 [FileTree] Node ${node.path} - isNewFile: ${isNewFile}, isDirectoryWithNewFiles: ${isDirectoryWithNewFiles}`);
    }
    
    return (
      <div key={node.path}>
        <div
          className={`
            flex items-center py-1 px-2 font-terminal text-terminal cursor-pointer hover:bg-bloomberg-panel
            ${isSelected ? 'bg-bloomberg-orange bg-opacity-20 border-l-2 border-bloomberg-orange' : ''}
            ${isCorresponding ? 'bg-bloomberg-green bg-opacity-10 border-l-2 border-bloomberg-green' : ''}
            ${isNewFile ? 'bg-bloomberg-green bg-opacity-30 border-l-2 border-bloomberg-green' : ''}
            ${isDirectoryWithNewFiles && !isNewFile ? 'bg-bloomberg-green bg-opacity-10 border-l-1 border-bloomberg-green' : ''}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleExpanded(node.path);
            } else {
              onFileClick(node.path);
            }
          }}
        >
          {/* Expand/Collapse Icon */}
          {node.type === 'directory' && (
            <span className="mr-1 text-cockpit-muted">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          
          {/* File/Directory Icon */}
          <span className="mr-2">
            {node.type === 'directory' ? '📁' : getFileIcon(node.name)}
          </span>
          
          {/* File/Directory Name */}
          <span className={`flex-1 truncate ${
            isNewFile ? 'text-bloomberg-green font-bold' :
            isDirectoryWithNewFiles ? 'text-bloomberg-green' :
            node.type === 'directory' ? 'text-bloomberg-text' : 'text-bloomberg-muted'
          }`}>
            {node.name}
            {isNewFile && <span className="ml-1 text-bloomberg-green">●</span>}
          </span>
          
          {/* File Size */}
          {node.type === 'file' && node.size && (
            <span className="ml-2 text-xs text-cockpit-muted">
              {formatFileSize(node.size)}
            </span>
          )}
          
          {/* Link Mode Indicator */}
          {isCorresponding && linkMode && (
            <span className="ml-1 text-cockpit-green text-xs">🔗</span>
          )}
        </div>
        
        {/* Children */}
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '📜';
      case 'css':
      case 'scss':
      case 'sass':
        return '🎨';
      case 'html':
      case 'htm':
        return '🌐';
      case 'md':
      case 'markdown':
        return '📝';
      case 'json':
        return '📊';
      case 'astro':
        return '🚀';
      case 'haml':
        return '💎';
      case 'rb':
        return '💎';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'yml':
      case 'yaml':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-4 w-4 border border-cockpit-amber border-t-transparent rounded-full mx-auto mb-2"></div>
        <div className="text-xs text-cockpit-muted">Loading files...</div>
      </div>
    );
  }

  if (error) {
    const isAstroNotFound = site === 'astro' && error.includes('not found');
    return (
      <div className="p-4 text-center">
        <div className="text-cockpit-red mb-2">⚠️</div>
        <div className="text-xs text-cockpit-text mb-2">{error}</div>
        {isAstroNotFound && (
          <div className="text-xs text-cockpit-muted mb-2">
            Run stage 1 to initialize the Astro project
          </div>
        )}
        <button
          onClick={() => loadFileTree()}
          className="cockpit-button text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tree || tree.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">📂</div>
        <div className="text-xs text-cockpit-muted">No files found</div>
      </div>
    );
  }

  return (
    <div className="font-terminal text-terminal">
      {/* Header */}
      <div className="p-2 border-b border-cockpit-border flex items-center justify-between">
        <span className="text-cockpit-muted">
          {tree.length} item{tree.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => loadFileTree()}
          className="text-cockpit-muted hover:text-cockpit-text text-xs"
          title="Refresh"
        >
          ↻
        </button>
      </div>
      
      {/* Tree */}
      <div className="overflow-auto">
        {tree.map(node => renderTreeNode(node))}
      </div>
    </div>
  );
};

export default FileTree;