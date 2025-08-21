import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for polling file changes
 * @param {string} site - 'middleman' or 'astro'
 * @param {number} interval - Polling interval in milliseconds (default: 3000)
 * @returns {Object} { changes, lastUpdate, isPolling }
 */
export const useFilePolling = (site, interval = 3000) => {
  const [changes, setChanges] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const lastPollRef = useRef(null);

  useEffect(() => {
    if (!site) return;

    const pollChanges = async () => {
      setIsPolling(true);
      
      try {
        const since = lastPollRef.current || new Date(Date.now() - interval);
        const response = await fetch(
          `/api/filesystem/changes?site=${site}&since=${since.toISOString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.changes && data.changes.length > 0) {
            setChanges(prev => [...prev, ...data.changes]);
            setLastUpdate(new Date(data.timestamp));
          }
          
          lastPollRef.current = new Date(data.timestamp);
        }
      } catch (error) {
        console.error('Failed to poll file changes:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Initial poll
    pollChanges();

    // Set up interval
    const intervalId = setInterval(pollChanges, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [site, interval]);

  const clearChanges = () => {
    setChanges([]);
  };

  return {
    changes,
    lastUpdate,
    isPolling,
    clearChanges
  };
};