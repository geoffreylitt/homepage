import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dev server status and controls
 * @param {string} site - 'middleman' or 'astro'
 * @returns {Object} Server status, controls, and output
 */
export const useDevServer = (site) => {
  const [status, setStatus] = useState('stopped');
  const [output, setOutput] = useState([]);
  const [port, setPort] = useState(null);
  const [pid, setPid] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll server status
  useEffect(() => {
    if (!site) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/devserver/${site}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setOutput(data.output || []);
          setPort(data.port);
          setPid(data.pid);
        }
      } catch (error) {
        console.error('Failed to poll server status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [site]);

  const startServer = async () => {
    if (loading || status === 'running' || status === 'starting') return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/devserver/${site}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const stopServer = async () => {
    if (loading || status === 'stopped' || status === 'stopping') return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/devserver/${site}/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-cockpit-green';
      case 'starting':
      case 'stopping':
        return 'text-cockpit-amber';
      case 'error':
        return 'text-cockpit-red';
      default:
        return 'text-cockpit-muted';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return '🟢';
      case 'starting':
        return '🟡';
      case 'stopping':
        return '🟠';
      case 'error':
        return '🔴';
      default:
        return '⚫';
    }
  };

  const isRunning = status === 'running';
  const isStopped = status === 'stopped' || status === 'error';
  const isTransitioning = status === 'starting' || status === 'stopping';

  return {
    status,
    output,
    port,
    pid,
    loading,
    isRunning,
    isStopped,
    isTransitioning,
    startServer,
    stopServer,
    getStatusColor,
    getStatusIcon
  };
};