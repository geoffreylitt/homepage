import React, { useState, useEffect } from 'react';

const IframePreview = ({ site, devServerStatus, linkMode }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [previousPort, setPreviousPort] = useState(null);

  // Default configuration for each site
  const siteConfig = {
    middleman: {
      defaultPort: 4567,
      name: 'Middleman'
    },
    astro: {
      defaultPort: 4321,
      name: 'Astro'
    }
  };

  const config = siteConfig[site];

  // Poll for server info to get the actual port
  useEffect(() => {
    const pollServerInfo = async () => {
      try {
        const response = await fetch(`/api/devserver/${site}/status`);
        if (response.ok) {
          const data = await response.json();
          setServerInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch server info:', error);
      }
    };

    if (devServerStatus === 'running') {
      pollServerInfo();
      const interval = setInterval(pollServerInfo, 2000);
      return () => clearInterval(interval);
    }
  }, [site, devServerStatus]);

  useEffect(() => {
    if (devServerStatus === 'running' && serverInfo) {
      const port = serverInfo.actualPort || serverInfo.port || config.defaultPort;
      const baseUrl = `http://localhost:${port}`;
      setCurrentUrl(baseUrl);
      setError(null);
      
      // Only force iframe refresh when port actually changes or server first starts
      if (previousPort !== port) {
        setIframeKey(prev => prev + 1);
        setPreviousPort(port);
      }
    } else {
      setCurrentUrl('');
      setPreviousPort(null);
    }
  }, [devServerStatus, serverInfo, config.defaultPort, previousPort]);

  const handleIframeLoad = () => {
    setError(null);
  };

  const handleIframeError = () => {
    setError(`Failed to load ${config.name} server`);
  };

  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-cockpit-panel">
      {/* URL Bar */}
      <div className="flex items-center p-2 bg-cockpit-bg border-b border-cockpit-border">
        <button
          onClick={refreshIframe}
          disabled={devServerStatus !== 'running'}
          className="cockpit-button mr-2 text-xs"
          title="Refresh"
        >
          ↻
        </button>
        <div className="flex-1 bg-cockpit-panel px-2 py-1 text-xs font-mono border border-cockpit-border rounded">
          {currentUrl || `${config.name} server not running`}
        </div>
        <div className={`ml-2 px-2 py-1 text-xs rounded ${
          devServerStatus === 'running' ? 'bg-cockpit-green text-cockpit-bg' :
          devServerStatus === 'starting' ? 'bg-cockpit-amber text-cockpit-bg' :
          devServerStatus === 'error' ? 'bg-cockpit-red text-white' :
          'bg-cockpit-muted text-white'
        }`}>
          {devServerStatus}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {devServerStatus === 'running' && currentUrl ? (
          <>
            {error ? (
              <div className="h-full flex items-center justify-center bg-cockpit-bg">
                <div className="text-center">
                  <div className="text-cockpit-red mb-2">⚠️</div>
                  <div className="text-sm text-cockpit-text mb-2">{error}</div>
                  <button
                    onClick={refreshIframe}
                    className="cockpit-button text-xs"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={currentUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`${config.name} Preview`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-cockpit-bg">
            <div className="text-center">
              {devServerStatus === 'starting' ? (
                <>
                  <div className="animate-spin h-8 w-8 border-2 border-cockpit-amber border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-cockpit-amber">Starting {config.name} server...</div>
                </>
              ) : devServerStatus === 'stopping' ? (
                <>
                  <div className="h-8 w-8 mx-auto mb-2">⏹️</div>
                  <div className="text-sm text-cockpit-muted">Stopping {config.name} server...</div>
                </>
              ) : devServerStatus === 'error' ? (
                <>
                  <div className="text-cockpit-red mb-2">❌</div>
                  <div className="text-sm text-cockpit-red">{config.name} server error</div>
                  <div className="text-xs text-cockpit-muted mt-1">Check server logs for details</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm text-cockpit-muted">
                    {config.name} server is stopped
                  </div>
                  <div className="text-xs text-cockpit-muted mt-1">
                    Start the server to see preview
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IframePreview;