import React, { useEffect, useRef } from 'react';
import { useTerminalPolling } from '../hooks/useTerminalPolling';
import { TerminalLine } from '../types';

interface TerminalProps {
  enabled?: boolean;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ enabled = true, className = '' }) => {
  const { lines, status, clear, isPolling } = useTerminalPolling(enabled);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineClassName = (line: TerminalLine): string => {
    const baseClass = 'font-terminal text-terminal leading-none';
    
    switch (line.type) {
      case 'command':
        return `${baseClass} text-bloomberg-orange`;
      case 'stdout':
        return `${baseClass} text-bloomberg-text`;
      case 'stderr':
        return `${baseClass} text-bloomberg-red`;
      case 'info':
        return `${baseClass} text-bloomberg-green`;
      default:
        return `${baseClass} text-bloomberg-muted`;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <span className="text-bloomberg-orange">●</span>;
      case 'completed':
        return <span className="text-bloomberg-green">●</span>;
      case 'error':
        return <span className="text-bloomberg-red">●</span>;
      default:
        return <span className="text-bloomberg-muted">●</span>;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className={`bloomberg-section flex flex-col h-full ${className}`}>
      {/* Terminal Header */}
      <div className="bloomberg-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>TERM</span>
          <span className="text-bloomberg-orange">│</span>
          {getStatusIcon()}
          <span>{getStatusText().toUpperCase()}</span>
        </div>
        
        <button
          onClick={clear}
          className="bloomberg-button"
          title="Clear terminal"
        >
          CLR
        </button>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 p-1 bg-bloomberg-bg overflow-y-auto"
        style={{ 
          minHeight: '200px',
          maxHeight: '400px'
        }}
      >
        {lines.length === 0 ? (
          <div className="text-center text-bloomberg-muted p-2">
            <div className="text-bloomberg-muted">TERMINAL READY</div>
          </div>
        ) : (
          <div>
            {lines.map((line, index) => {
              const timestamp = new Date(line.timestamp).toLocaleTimeString();
              
              return (
                <div 
                  key={`${line.timestamp}-${index}`}
                  className="flex items-start"
                >
                  {/* Timestamp */}
                  <span className="text-bloomberg-muted w-12 flex-shrink-0">
                    {timestamp.split(':').slice(1).join('')}
                  </span>
                  
                  {/* Line content */}
                  <div className={getLineClassName(line)}>
                    {line.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="bloomberg-header border-t border-bloomberg-border">
        <div className="flex items-center justify-between">
          <span>LINES: {lines.length}</span>
          <span className="text-bloomberg-muted">100MS</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;