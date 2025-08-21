import React, { useState, useRef, useEffect } from 'react';
import { FileDiff } from '../../hooks/useAudit';

interface DiffViewerProps {
  diff: FileDiff | null;
  loading?: boolean;
}

type ViewMode = 'summary' | 'normalized' | 'raw';

export default function DiffViewer({ diff, loading = false }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [leftScrollTop, setLeftScrollTop] = useState(0);
  const [rightScrollTop, setRightScrollTop] = useState(0);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const syncScrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync scroll between panels
  const handleScroll = (source: 'left' | 'right', scrollTop: number) => {
    // Clear any pending sync to avoid feedback loops
    if (syncScrollTimeoutRef.current) {
      clearTimeout(syncScrollTimeoutRef.current);
    }

    // Update state immediately for the source
    if (source === 'left') {
      setLeftScrollTop(scrollTop);
    } else {
      setRightScrollTop(scrollTop);
    }

    // Sync to the other panel with a small delay to avoid infinite loops
    syncScrollTimeoutRef.current = setTimeout(() => {
      if (source === 'left' && rightPanelRef.current) {
        rightPanelRef.current.scrollTop = scrollTop;
        setRightScrollTop(scrollTop);
      } else if (source === 'right' && leftPanelRef.current) {
        leftPanelRef.current.scrollTop = scrollTop;
        setLeftScrollTop(scrollTop);
      }
    }, 10);
  };

  // Parse diff content for line-by-line highlighting
  const parseDiffLines = (diffContent: string) => {
    if (!diffContent) return [];
    
    // Split by lines and filter out diff headers and separators
    const lines = diffContent.split('\n');
    const contentLines = lines.filter(line => 
      !line.startsWith('---') && 
      !line.startsWith('+++') && 
      !line.startsWith('@@') &&
      !line.startsWith('===') &&
      line !== ''
    );
    
    return contentLines
      .map((line, index) => ({
        number: index + 1,
        content: line.length > 0 ? line.substring(1) : '', // Remove diff marker (+, -, or space)
        type: line.startsWith('+') ? 'addition' : 
              line.startsWith('-') ? 'deletion' : 
              'unchanged',
        originalLine: line
      }))
      .filter(line => line.content.trim() !== ''); // Remove empty lines
  };

  // Extract only changed lines from diff
  const getChangedLines = (diffContent: string) => {
    if (!diffContent) return { additions: [], deletions: [] };
    
    const lines = diffContent.split('\n');
    const additions = lines
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.substring(1))
      .filter(line => line.trim() !== '');
    
    const deletions = lines
      .filter(line => line.startsWith('-') && !line.startsWith('---'))
      .map(line => line.substring(1))
      .filter(line => line.trim() !== '');
    
    return { additions, deletions };
  };

  const getContentToShow = () => {
    if (!diff) return { left: '', right: '', diffLines: [], changedLines: { additions: [], deletions: [] } };
    
    if (viewMode === 'raw') {
      return {
        left: diff.middlemanContent,
        right: diff.astroContent,
        diffLines: parseDiffLines(diff.rawDiff),
        changedLines: getChangedLines(diff.rawDiff)
      };
    } else if (viewMode === 'normalized') {
      return {
        left: diff.normalizedMiddleman,
        right: diff.normalizedAstro,
        diffLines: parseDiffLines(diff.diff),
        changedLines: getChangedLines(diff.diff)
      };
    } else {
      // summary mode
      return {
        left: '',
        right: '',
        diffLines: [],
        changedLines: getChangedLines(diff.diff)
      };
    }
  };

  const { left, right, changedLines } = getContentToShow();

  // Format HTML content with line numbers
  const formatContent = (content: string) => {
    if (!content) return [];
    
    return content.split('\n').map((line, index) => ({
      number: index + 1,
      content: line
    }));
  };

  const leftLines = formatContent(left);
  const rightLines = formatContent(right);

  const getStatusColor = () => {
    if (!diff) return 'text-bloomberg-muted';
    return diff.identical ? 'text-bloomberg-green' : 'text-bloomberg-red';
  };

  const getStatusText = () => {
    if (!diff) return 'NO FILE SELECTED';
    return diff.identical ? 'IDENTICAL' : 'DIFFERENT';
  };

  return (
    <div className="h-full flex flex-col bg-bloomberg-bg">
      {/* Header */}
      <div className="bloomberg-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>DIFF</span>
            <span className="text-bloomberg-orange">│</span>
            <span className={getStatusColor()}>
              {getStatusText()}
            </span>
          </div>
          
          {diff && (
            <div className="flex items-center space-x-2">
              <button
                className={`bloomberg-button text-xs ${
                  viewMode === 'summary' ? 'active' : ''
                }`}
                onClick={() => setViewMode('summary')}
              >
                SUMMARY
              </button>
              <button
                className={`bloomberg-button text-xs ${
                  viewMode === 'normalized' ? 'active' : ''
                }`}
                onClick={() => setViewMode('normalized')}
              >
                FULL DIFF
              </button>
              <button
                className={`bloomberg-button text-xs ${
                  viewMode === 'raw' ? 'active' : ''
                }`}
                onClick={() => setViewMode('raw')}
              >
                RAW
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex border-t border-bloomberg-border">
        {loading && (
          <div className="flex-1 flex items-center justify-center text-bloomberg-muted">
            LOADING DIFF...
          </div>
        )}

        {!loading && !diff && (
          <div className="flex-1 flex items-center justify-center text-bloomberg-muted">
            SELECT A FILE TO VIEW DIFF
          </div>
        )}

        {!loading && diff && viewMode === 'summary' && (
          <div className="flex-1 overflow-auto bg-bloomberg-bg font-terminal text-terminal p-4">
            <div className="space-y-4">
              {/* Deletions */}
              {changedLines.deletions.length > 0 && (
                <div>
                  <h3 className="text-bloomberg-red mb-2 text-xs uppercase">
                    Removed from Middleman ({changedLines.deletions.length} lines)
                  </h3>
                  <div className="bg-bloomberg-panel p-2 space-y-1">
                    {changedLines.deletions.slice(0, 20).map((line, index) => (
                      <div key={index} className="flex text-xs">
                        <span className="text-bloomberg-red mr-2">−</span>
                        <span className="font-mono text-bloomberg-red bg-red-900 bg-opacity-20 px-1">
                          {line}
                        </span>
                      </div>
                    ))}
                    {changedLines.deletions.length > 20 && (
                      <div className="text-xs text-bloomberg-muted">
                        ... and {changedLines.deletions.length - 20} more lines
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additions */}
              {changedLines.additions.length > 0 && (
                <div>
                  <h3 className="text-bloomberg-green mb-2 text-xs uppercase">
                    Added in Astro ({changedLines.additions.length} lines)
                  </h3>
                  <div className="bg-bloomberg-panel p-2 space-y-1">
                    {changedLines.additions.slice(0, 20).map((line, index) => (
                      <div key={index} className="flex text-xs">
                        <span className="text-bloomberg-green mr-2">+</span>
                        <span className="font-mono text-bloomberg-green bg-green-900 bg-opacity-20 px-1">
                          {line}
                        </span>
                      </div>
                    ))}
                    {changedLines.additions.length > 20 && (
                      <div className="text-xs text-bloomberg-muted">
                        ... and {changedLines.additions.length - 20} more lines
                      </div>
                    )}
                  </div>
                </div>
              )}

              {changedLines.deletions.length === 0 && changedLines.additions.length === 0 && (
                <div className="text-center text-bloomberg-muted">
                  No differences found after normalization
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && diff && (viewMode === 'normalized' || viewMode === 'raw') && (
          <>
            {/* Left Panel - Middleman */}
            <div className="flex-1 flex flex-col border-r border-bloomberg-border">
              <div className="bloomberg-header text-xs">
                <div className="flex items-center justify-between">
                  <span>MIDDLEMAN</span>
                  <span className="text-bloomberg-muted">
                    {leftLines.length} LINES
                  </span>
                </div>
              </div>
              
              <div
                ref={leftPanelRef}
                className="flex-1 overflow-auto bg-bloomberg-bg font-terminal text-terminal"
                onScroll={(e) => handleScroll('left', e.currentTarget.scrollTop)}
              >
                <div className="p-2">
                  {leftLines.map((line, index) => (
                    <div
                      key={index}
                      className="flex text-xs leading-tight hover:bg-bloomberg-panel"
                    >
                      <span className="w-8 text-right mr-2 text-bloomberg-muted flex-shrink-0">
                        {line.number}
                      </span>
                      <span className="flex-1 whitespace-pre font-mono">
                        {line.content || ' '}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Astro */}
            <div className="flex-1 flex flex-col">
              <div className="bloomberg-header text-xs">
                <div className="flex items-center justify-between">
                  <span>ASTRO</span>
                  <span className="text-bloomberg-muted">
                    {rightLines.length} LINES
                  </span>
                </div>
              </div>
              
              <div
                ref={rightPanelRef}
                className="flex-1 overflow-auto bg-bloomberg-bg font-terminal text-terminal"
                onScroll={(e) => handleScroll('right', e.currentTarget.scrollTop)}
              >
                <div className="p-2">
                  {rightLines.map((line, index) => (
                    <div
                      key={index}
                      className="flex text-xs leading-tight hover:bg-bloomberg-panel"
                    >
                      <span className="w-8 text-right mr-2 text-bloomberg-muted flex-shrink-0">
                        {line.number}
                      </span>
                      <span className="flex-1 whitespace-pre font-mono">
                        {line.content || ' '}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {diff && (
        <div className="border-t border-bloomberg-border p-2 text-xs">
          <div className="flex items-center justify-between text-bloomberg-muted">
            <span>
              FILE: {diff.file}
            </span>
            <span>
              {viewMode === 'summary' ? 'SUMMARY' : 
               viewMode === 'normalized' ? 'FULL DIFF' : 
               'RAW'} VIEW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}