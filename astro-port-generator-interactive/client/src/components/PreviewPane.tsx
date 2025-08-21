import React, { useState } from 'react';
import { Allotment } from 'allotment';
import IframePreview from './IframePreview';
import DevServerControl from './DevServerControl';
import FileTree from './FileTree';
import CodeViewer from './CodeViewer';

const PreviewPane = ({ 
  site, 
  linkMode, 
  selectedFile, 
  onFileSelect, 
  correspondingFile,
  newFiles = new Set()
}) => {
  const [devServerStatus, setDevServerStatus] = useState('stopped');
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [fileContent, setFileContent] = useState(null);

  const handleFileClick = async (filePath) => {
    onFileSelect(filePath);
    
    // Load file content
    try {
      const response = await fetch(`/api/filesystem/content?site=${site}&filePath=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data);
        setShowCodeViewer(true);
      } else {
        console.error('Failed to load file content');
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleDevServerStatusChange = (status) => {
    setDevServerStatus(status);
  };

  return (
    <div className="w-full h-full">
      <Allotment vertical defaultSizes={[65, 35]} separator={true}>
        <div className="h-full border-b border-cockpit-border flex flex-col">
          {/* Dev Server Controls */}
          <div className="p-2 bg-cockpit-panel border-b border-cockpit-border">
            <DevServerControl 
              site={site}
              onStatusChange={handleDevServerStatusChange}
            />
          </div>
          
          {/* Iframe */}
          <div className="flex-1">
            <IframePreview 
              site={site}
              devServerStatus={devServerStatus}
              linkMode={linkMode}
            />
          </div>
        </div>

        <div className="h-full">
          <Allotment defaultSizes={[50, 50]} separator={true}>
            <div className="h-full border-r border-cockpit-border flex flex-col">
              <div className="p-2 bg-cockpit-panel border-b border-cockpit-border">
                <h3 className="text-xs font-medium text-cockpit-text">Files</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <FileTree 
                  site={site}
                  onFileClick={handleFileClick}
                  selectedFile={selectedFile}
                  linkMode={linkMode}
                  correspondingFile={correspondingFile}
                  newFiles={newFiles}
                />
              </div>
            </div>

            <div className="h-full flex flex-col">
              <div className="p-2 bg-cockpit-panel border-b border-cockpit-border flex items-center justify-between">
                <h3 className="text-xs font-medium text-cockpit-text">
                  {fileContent ? fileContent.path : 'Code Viewer'}
                </h3>
                {showCodeViewer && (
                  <button
                    onClick={() => setShowCodeViewer(false)}
                    className="text-xs text-cockpit-muted hover:text-cockpit-text"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {showCodeViewer && fileContent ? (
                  <CodeViewer 
                    content={fileContent.content}
                    filePath={fileContent.path}
                    extension={fileContent.extension}
                  />
                ) : (
                  <div className="p-4 text-xs text-cockpit-muted text-center">
                    Select a file to view its contents
                  </div>
                )}
              </div>
            </div>
          </Allotment>
        </div>
      </Allotment>
    </div>
  );
};

export default PreviewPane;