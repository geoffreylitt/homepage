import React from 'react';
import { FileComparison, ComparisonStats } from '../../hooks/useAudit';

interface FileDiffListProps {
  files: FileComparison[];
  stats: ComparisonStats;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  loading?: boolean;
}

export default function FileDiffList({
  files,
  stats,
  selectedFile,
  onFileSelect,
  loading = false
}: FileDiffListProps) {
  const getStatusColor = (status: FileComparison['status']) => {
    switch (status) {
      case 'identical':
        return 'text-bloomberg-green';
      case 'different':
        return 'text-bloomberg-red';
      case 'missing-middleman':
        return 'text-bloomberg-muted';
      case 'missing-astro':
        return 'text-bloomberg-muted';
      default:
        return 'text-bloomberg-text';
    }
  };

  const getStatusSymbol = (status: FileComparison['status']) => {
    switch (status) {
      case 'identical':
        return '✓';
      case 'different':
        return '✗';
      case 'missing-middleman':
        return '◀';
      case 'missing-astro':
        return '▶';
      default:
        return '?';
    }
  };

  const getStatusLabel = (status: FileComparison['status']) => {
    switch (status) {
      case 'identical':
        return 'IDENTICAL';
      case 'different':
        return 'DIFFERENT';
      case 'missing-middleman':
        return 'MISSING FROM MIDDLEMAN';
      case 'missing-astro':
        return 'MISSING FROM ASTRO';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="h-full flex flex-col bg-bloomberg-bg">
      {/* Header */}
      <div className="bloomberg-header">
        <div className="flex items-center justify-between">
          <span>FILES</span>
          <span className="text-bloomberg-orange">│</span>
          <span className="text-bloomberg-muted">
            {stats.different}/{stats.total} DIFF
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="border-b border-bloomberg-border p-2 text-terminal bg-bloomberg-panel">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-bloomberg-green">✓</span>
            <span>{stats.identical}</span>
            <span className="text-bloomberg-muted">identical</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-bloomberg-red">✗</span>
            <span>{stats.different}</span>
            <span className="text-bloomberg-muted">different</span>
          </div>
          {stats.missingMiddleman > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-bloomberg-muted">◀</span>
              <span>{stats.missingMiddleman}</span>
              <span className="text-bloomberg-muted">MM only</span>
            </div>
          )}
          {stats.missingAstro > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-bloomberg-muted">▶</span>
              <span>{stats.missingAstro}</span>
              <span className="text-bloomberg-muted">Astro only</span>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-bloomberg-muted">
            LOADING FILES...
          </div>
        )}
        
        {!loading && files.length === 0 && (
          <div className="p-4 text-center text-bloomberg-muted">
            NO HTML FILES FOUND
          </div>
        )}

        {!loading && files.map((file) => (
          <div
            key={file.relativePath}
            className={`
              border-b border-bloomberg-border p-2 cursor-pointer hover:bg-bloomberg-panel transition-colors
              ${selectedFile === file.relativePath ? 'bg-bloomberg-orange text-black' : 'hover:bg-bloomberg-panel'}
            `}
            onClick={() => onFileSelect(file.relativePath)}
          >
            <div className="flex items-start space-x-2">
              {/* Status Symbol */}
              <span
                className={`
                  inline-block w-4 flex-shrink-0 text-center font-bold
                  ${selectedFile === file.relativePath ? 'text-black' : getStatusColor(file.status)}
                `}
              >
                {getStatusSymbol(file.status)}
              </span>

              {/* File Path */}
              <div className="flex-1 min-w-0">
                <div
                  className={`
                    text-terminal font-terminal break-all
                    ${selectedFile === file.relativePath ? 'text-black' : 'text-bloomberg-text'}
                  `}
                >
                  {file.relativePath}
                </div>
                
                {/* Status Label - only show for non-standard cases */}
                {(file.status === 'missing-middleman' || file.status === 'missing-astro') && (
                  <div
                    className={`
                      text-xs mt-1
                      ${selectedFile === file.relativePath ? 'text-black opacity-70' : 'text-bloomberg-muted'}
                    `}
                  >
                    {getStatusLabel(file.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-bloomberg-border p-2 text-xs text-bloomberg-muted">
        {files.length > 0 && !selectedFile && (
          <div>SELECT A FILE TO VIEW DIFF</div>
        )}
        {selectedFile && (
          <div>VIEWING: {selectedFile}</div>
        )}
      </div>
    </div>
  );
}