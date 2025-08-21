import React, { useState, useEffect } from 'react';
import { WizardProps, Stage, StageStatus } from '../types';

const Wizard: React.FC<WizardProps> = ({ currentStage, stageStatus, onStageComplete, onStageStart }) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [viewingStage, setViewingStage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Load stages on mount
  useEffect(() => {
    fetch('/api/generator/stages')
      .then(res => res.json())
      .then(data => {
        setStages(data.stages || []);
      })
      .catch(console.error);
  }, []);

  // Update viewing stage when current stage changes
  useEffect(() => {
    if (currentStage > 0) {
      setViewingStage(currentStage);
    }
  }, [currentStage]);

  const executeStage = async (stageId: number) => {
    if (executing) return;
    
    setExecuting(true);
    setError(null);
    
    try {
      // Capture files before stage execution if callback is provided
      if (onStageStart) {
        console.log(`🧙 [Wizard] Calling onStageStart for stage ${stageId}`);
        await onStageStart();
        console.log(`✅ [Wizard] onStageStart completed for stage ${stageId}`);
      } else {
        console.log(`⚠️ [Wizard] onStageStart not provided for stage ${stageId}`);
      }
      
      const response = await fetch(`/api/generator/stages/${stageId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        onStageComplete();
      } else {
        console.error('Stage execution failed:', result.error);
        setError(result.error);
      }
    } catch (error: any) {
      console.error('Failed to execute stage:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const resetAllStages = async () => {
    if (!confirm('This will reset all stage progress and remove the astro-port-generated directory. Are you sure?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/generator/reset', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setError(null);
        setViewingStage(1);
        onStageComplete();
        console.log('Reset successful:', result.message);
      } else {
        console.error('Reset failed:', result.error);
        setError(`Reset failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Failed to reset stages:', error);
      setError(`Reset failed: ${error.message}`);
    }
  };

  const getStageStatus = (stageId: number) => {
    return stageStatus[stageId] || 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '●';
      case 'running':
        return '●';
      case 'error':
        return '●';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-bloomberg-green';
      case 'running':
        return 'text-bloomberg-orange';
      case 'error':
        return 'text-bloomberg-red';
      default:
        return 'text-bloomberg-muted';
    }
  };

  const completedStages = Object.values(stageStatus).filter(s => s === 'completed').length;
  const totalStages = stages.length;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  const currentStageData = stages.find(s => s.id === viewingStage);
  const currentStatus = getStageStatus(viewingStage);
  
  const canExecute = currentStatus === 'pending' && 
                    (viewingStage === 1 || getStageStatus(viewingStage - 1) === 'completed');

  const canGoNext = viewingStage < totalStages;
  const canGoPrevious = viewingStage > 1;

  return (
    <div className="font-terminal text-terminal">
      {/* Progress Overview */}
      <div className="bloomberg-header border-b border-bloomberg-border mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>PROGRESS</span>
            <span className="text-bloomberg-orange">│</span>
            <div className="flex">
              {Array.from({length: totalStages}, (_, i) => (
                <span key={i} className={`${
                  i < completedStages ? 'text-bloomberg-green' : 'text-bloomberg-muted'
                }`}>●</span>
              ))}
            </div>
            <span className="text-bloomberg-muted">
              {completedStages}/{totalStages}
            </span>
          </div>

          <button
            onClick={resetAllStages}
            disabled={executing}
            className="bloomberg-button disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset all progress and remove astro-port-generated directory"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Current Stage Display */}
      {currentStageData && (
        <div className="bg-bloomberg-bg">
          {/* Stage Header */}
          <div className="bloomberg-header border border-bloomberg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>STAGE {viewingStage}</span>
                <span className="text-bloomberg-orange">│</span>
                <span className={getStatusColor(currentStatus)}>
                  {getStatusIcon(currentStatus)}
                </span>
                <span className="text-bloomberg-muted">{currentStatus.toUpperCase()}</span>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewingStage(Math.max(1, viewingStage - 1))}
                  disabled={!canGoPrevious || executing}
                  className="bloomberg-button disabled:opacity-50"
                >
                  ←
                </button>
                
                <span className="text-bloomberg-muted px-1">
                  {viewingStage}/{totalStages}
                </span>
                
                <button
                  onClick={() => setViewingStage(Math.min(totalStages, viewingStage + 1))}
                  disabled={!canGoNext || executing}
                  className="bloomberg-button disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="border-l border-r border-b border-bloomberg-border p-1">
            {/* Stage Name */}
            <div className="text-bloomberg-orange mb-1">
              {currentStageData.name.toUpperCase()}
            </div>

            {/* Stage Description */}
            <div className="text-bloomberg-text-dim mb-2">
              {currentStageData.description}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-bloomberg-red text-bloomberg-bg p-1 mb-2">
                ERROR: {error}
              </div>
            )}

            {/* Execute Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => executeStage(viewingStage)}
                disabled={!canExecute || executing}
                className={`bloomberg-button ${canExecute && !executing ? 'active' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {executing ? (
                  <span>EXECUTING...</span>
                ) : (
                  <span>
                    {currentStatus === 'completed' ? 'RE-RUN' : 'EXECUTE'}
                  </span>
                )}
              </button>

              {!canExecute && currentStatus === 'pending' && viewingStage > 1 && (
                <div className="text-bloomberg-muted">
                  COMPLETE STAGE {viewingStage - 1} FIRST
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Wizard;