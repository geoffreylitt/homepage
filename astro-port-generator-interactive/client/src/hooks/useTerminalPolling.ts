import { useState, useEffect, useRef } from 'react';
import { TerminalLine, TerminalOutput } from '../types';

interface UseTerminalPollingResult {
  lines: TerminalLine[];
  status: TerminalOutput['status'];
  clear: () => void;
  isPolling: boolean;
}

export const useTerminalPolling = (enabled: boolean = true): UseTerminalPollingResult => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [status, setStatus] = useState<TerminalOutput['status']>('idle');
  const [isPolling, setIsPolling] = useState(false);
  const lastTimestamp = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollTerminal = async () => {
    try {
      setIsPolling(true);
      const response = await fetch(`/api/terminal/output?since=${lastTimestamp.current}`);
      
      if (response.ok) {
        const data: TerminalOutput = await response.json();
        
        // Add new lines to existing lines
        if (data.lines.length > 0) {
          setLines(prevLines => [...prevLines, ...data.lines]);
          // Update timestamp to the latest line's timestamp
          const latestTimestamp = Math.max(...data.lines.map(line => line.timestamp));
          lastTimestamp.current = latestTimestamp;
        }
        
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to poll terminal:', error);
    } finally {
      setIsPolling(false);
    }
  };

  const clear = async () => {
    try {
      const response = await fetch('/api/terminal/clear', { method: 'POST' });
      if (response.ok) {
        setLines([]);
        lastTimestamp.current = 0;
        setStatus('idle');
      }
    } catch (error) {
      console.error('Failed to clear terminal:', error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    pollTerminal();

    // Set up polling interval
    intervalRef.current = setInterval(pollTerminal, 100); // Poll every 100ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);

  return {
    lines,
    status,
    clear,
    isPolling
  };
};