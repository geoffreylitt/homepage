import React, { useState, useEffect } from 'react';

const DevServerControl = ({ site, onStatusChange }) => {
  const [status, setStatus] = useState('stopped');
  const [output, setOutput] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [port, setPort] = useState(null);
  const [error, setError] = useState(null);

  // Configuration for each site
  const siteConfig = {
    middleman: {
      name: 'Middleman',
      defaultPort: 4567
    },
    astro: {
      name: 'Astro',
      defaultPort: 4321
    }
  };

  const config = siteConfig[site];

  // Poll server status
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/devserver/${site}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setOutput(data.output || []);
          setPort(data.port);
          onStatusChange(data.status);
          // Clear error when we successfully get status
          if (data.status === 'running') {
            setError(null);
          }
        }
      } catch (error) {
        console.error('Failed to poll server status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [site, onStatusChange]);

  const startServer = async () => {
    setError(null); // Clear any previous errors
    try {
      const response = await fetch(`/api/devserver/${site}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${config.name} server starting:`, data);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
        console.error(`Failed to start ${config.name} server:`, errorData);
      }
    } catch (error) {
      setError(`Error starting ${config.name} server: ${error.message}`);
      console.error(`Error starting ${config.name} server:`, error);
    }
  };

  const stopServer = async () => {
    try {
      const response = await fetch(`/api/devserver/${site}/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${config.name} server stopping:`, data);
      } else {
        const error = await response.json();
        console.error(`Failed to stop ${config.name} server:`, error);
      }
    } catch (error) {
      console.error(`Error stopping ${config.name} server:`, error);
    }
  };

  const resetServer = async () => {
    try {
      const response = await fetch(`/api/devserver/${site}/reset`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${config.name} server reset:`, data);
        setStatus('stopped');
      } else {
        const error = await response.json();
        console.error(`Failed to reset ${config.name} server:`, error);
      }
    } catch (error) {
      console.error(`Error resetting ${config.name} server:`, error);
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

  return (
    <div className="space-y-2">
      {/* Server Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs">{getStatusIcon()}</span>
          <span className="text-xs font-medium">
            {config.name} :{port || config.defaultPort}
          </span>
          <span className={`text-xs ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {status === 'stopped' || status === 'error' ? (
            <button
              onClick={startServer}
              className="cockpit-button text-xs px-2 py-1"
            >
              ▶ Start
            </button>
          ) : status === 'running' ? (
            <button
              onClick={stopServer}
              className="cockpit-button text-xs px-2 py-1"
            >
              ⏹ Stop
            </button>
          ) : status === 'stopping' ? (
            <div className="flex items-center space-x-1">
              <div className="text-xs text-cockpit-amber">Stopping...</div>
              <button
                onClick={resetServer}
                className="cockpit-button text-xs px-1 py-1"
                title="Force reset server status"
              >
                🔄
              </button>
            </div>
          ) : (
            <div className="text-xs text-cockpit-amber">Starting...</div>
          )}
          
          {output.length > 0 && (
            <button
              onClick={() => setShowOutput(!showOutput)}
              className="cockpit-button text-xs px-2 py-1"
              title="Toggle server output"
            >
              📋
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-cockpit-red/10 border border-cockpit-red rounded p-2">
          <div className="text-xs text-cockpit-red">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Server Output */}
      {showOutput && output.length > 0 && (
        <div className="bg-cockpit-bg border border-cockpit-border rounded p-2 max-h-32 overflow-y-auto">
          <div className="text-xs font-mono">
            {output.slice(-10).map((line, index) => (
              <div 
                key={index} 
                className={`${
                  line.includes('[stderr]') ? 'text-cockpit-red' :
                  line.includes('Error') || line.includes('error') ? 'text-cockpit-red' :
                  line.includes('ready') || line.includes('Local:') ? 'text-cockpit-green' :
                  'text-cockpit-text'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevServerControl;