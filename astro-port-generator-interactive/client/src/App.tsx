import React, { useState, useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Wizard from './components/Wizard';
import Terminal from './components/Terminal';
import PreviewPane from './components/PreviewPane';
import LinkModeToggle from './components/LinkModeToggle';
import { useStageFiles } from './hooks/useStageFiles';
import { StageStatus } from './types';

function App() {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageStatus, setStageStatus] = useState<StageStatus>({});
  const [linkMode, setLinkMode] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    middleman: string | null;
    astro: string | null;
  }>({
    middleman: null,
    astro: null
  });

  // Track new files created during each stage
  const { newFiles, capturePreStageFiles, clearNewFiles } = useStageFiles(currentStage, stageStatus);
  
  // Debug log when newFiles changes
  useEffect(() => {
    console.log(`🏠 [App] newFiles updated: size=${newFiles.size}`, Array.from(newFiles));
  }, [newFiles]);

  // Poll for stage status updates
  useEffect(() => {
    const pollStatus = () => {
      fetch('/api/generator/status')
        .then(res => res.json())
        .then(data => {
          setCurrentStage(data.currentStage);
          setStageStatus(data.status);
        })
        .catch(console.error);
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (site: string, filePath: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [site]: filePath
    }));
  };

  const handleStageComplete = () => {
    // Refresh status after stage completion
    setTimeout(() => {
      fetch('/api/generator/status')
        .then(res => res.json())
        .then(data => {
          setCurrentStage(data.currentStage);
          setStageStatus(data.status);
        })
        .catch(console.error);
    }, 500);
  };

  return (
    <div className="h-screen bg-bloomberg-bg text-bloomberg-text font-terminal text-terminal flex flex-col">
      {/* Bloomberg Terminal Header */}
      <div className="flex-shrink-0 bloomberg-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-bloomberg-orange">ASTRO</span>
            <span>PORT GENERATOR</span>
            <span className="text-bloomberg-muted">INTERACTIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <LinkModeToggle 
              enabled={linkMode} 
              onToggle={setLinkMode}
            />
            <span className="text-bloomberg-muted">│</span>
            <span className="text-bloomberg-orange">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content with 3 Column Layout */}
      <div className="flex-1 min-h-0">
        <Allotment defaultSizes={[33.33, 33.33, 33.33]}>
          {/* Column 1: Step Executor */}
          <div className="h-full bloomberg-section flex flex-col">
            <div className="bloomberg-header flex items-center justify-between">
              <span>EXEC</span>
              <span className="text-bloomberg-orange">│</span>
              <span className="text-bloomberg-muted">STAGE {currentStage}/8</span>
            </div>
            <div className="flex-1 min-h-0">
              <Allotment vertical defaultSizes={[50, 50]}>
                <div className="h-full border-b border-bloomberg-border p-1">
                  <Wizard 
                    currentStage={currentStage}
                    stageStatus={stageStatus}
                    onStageComplete={handleStageComplete}
                    onStageStart={capturePreStageFiles}
                  />
                </div>
                
                <div className="h-full">
                  <Terminal enabled={true} />
                </div>
              </Allotment>
            </div>
          </div>

          {/* Column 2: Middleman Source */}
          <div className="h-full bloomberg-section flex flex-col">
            <div className="bloomberg-header flex items-center justify-between">
              <span>SRC</span>
              <span className="text-bloomberg-orange">│</span>
              <span className="text-bloomberg-muted">MIDDLEMAN</span>
            </div>
            <div className="flex-1">
              <PreviewPane
                site="middleman"
                linkMode={linkMode}
                selectedFile={selectedFiles.middleman}
                onFileSelect={(filePath) => handleFileSelect('middleman', filePath)}
                correspondingFile={selectedFiles.astro}
              />
            </div>
          </div>

          {/* Column 3: Astro Generated */}
          <div className="h-full bloomberg-section flex flex-col">
            <div className="bloomberg-header flex items-center justify-between">
              <span>DST</span>
              <span className="text-bloomberg-orange">│</span>
              <span className="text-bloomberg-muted">ASTRO</span>
            </div>
            <div className="flex-1">
              <PreviewPane
                site="astro"
                linkMode={linkMode}
                selectedFile={selectedFiles.astro}
                onFileSelect={(filePath) => handleFileSelect('astro', filePath)}
                correspondingFile={selectedFiles.middleman}
                newFiles={newFiles}
              />
            </div>
          </div>
        </Allotment>
      </div>

      {/* Bloomberg Terminal Status Bar */}
      <div className="flex-shrink-0 bloomberg-header border-t border-bloomberg-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>STATUS</span>
            <span className="text-bloomberg-orange">│</span>
            <span>STAGE {currentStage}/8</span>
            {currentStage > 0 && stageStatus[currentStage] && (
              <>
                <span className="text-bloomberg-orange">│</span>
                <span className={`${
                  stageStatus[currentStage] === 'completed' ? 'text-bloomberg-green' :
                  stageStatus[currentStage] === 'running' ? 'text-bloomberg-orange' :
                  stageStatus[currentStage] === 'error' ? 'text-bloomberg-red' :
                  'text-bloomberg-muted'
                }`}>
                  {stageStatus[currentStage].toUpperCase()}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {linkMode && (
              <>
                <span className="text-bloomberg-orange">LINK</span>
                <span className="text-bloomberg-orange">│</span>
              </>
            )}
            <span className="text-bloomberg-muted">TERMINAL LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;