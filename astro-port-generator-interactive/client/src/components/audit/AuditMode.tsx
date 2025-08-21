import React, { useEffect } from 'react';
import { Allotment } from 'allotment';
import FileDiffList from './FileDiffList';
import DiffViewer from './DiffViewer';
import DiffControls from './DiffControls';
import { useAudit } from '../../hooks/useAudit';

export default function AuditMode() {
  const {
    files,
    stats,
    buildStatus,
    selectedFile,
    fileDiff,
    normalizationOptions,
    loading,
    error,
    loadFiles,
    loadFileDiff,
    updateNormalizationOptions,
    checkBuildStatus,
    copyDiffToClipboard,
    setError,
  } = useAudit();

  const handleFileSelect = async (filePath: string) => {
    await loadFileDiff(filePath);
  };

  const handleRefresh = async () => {
    await Promise.all([
      loadFiles(true),
      checkBuildStatus()
    ]);
  };

  const handleCopyDiff = async (diff: any) => {
    const success = await copyDiffToClipboard(diff);
    return success;
  };

  // Show build status errors
  useEffect(() => {
    if (buildStatus && (!buildStatus.middleman.exists || !buildStatus.astro.exists)) {
      const missingBuilds = [];
      if (!buildStatus.middleman.exists) missingBuilds.push('Middleman');
      if (!buildStatus.astro.exists) missingBuilds.push('Astro');
      
      setError(`Missing build directories: ${missingBuilds.join(', ')}. Run builds first.`);
    }
  }, [buildStatus, setError]);

  return (
    <div className="h-full bg-bloomberg-bg text-bloomberg-text font-terminal text-terminal flex flex-col">
      {/* Bloomberg Terminal Header */}
      <div className="flex-shrink-0 bloomberg-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-bloomberg-orange">AUDIT</span>
            <span>HTML COMPARISON</span>
            <span className="text-bloomberg-muted">MIDDLEMAN ↔ ASTRO</span>
          </div>
          <div className="flex items-center space-x-2">
            {buildStatus && (
              <>
                <span className={`text-xs ${
                  buildStatus.middleman.exists ? 'text-bloomberg-green' : 'text-bloomberg-red'
                }`}>
                  MM: {buildStatus.middleman.exists ? 'OK' : 'MISSING'}
                </span>
                <span className="text-bloomberg-muted">│</span>
                <span className={`text-xs ${
                  buildStatus.astro.exists ? 'text-bloomberg-green' : 'text-bloomberg-red'
                }`}>
                  ASTRO: {buildStatus.astro.exists ? 'OK' : 'MISSING'}
                </span>
                <span className="text-bloomberg-muted">│</span>
              </>
            )}
            <span className="text-bloomberg-orange">LIVE</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 bg-bloomberg-red text-black p-2 text-xs">
          <div className="flex items-center justify-between">
            <span>ERROR: {error}</span>
            <button
              onClick={() => setError(null)}
              className="px-2 py-0 bg-black text-bloomberg-red hover:bg-bloomberg-panel"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <Allotment defaultSizes={[25, 50, 25]}>
          {/* Left Panel: File List */}
          <div className="h-full bloomberg-section">
            <FileDiffList
              files={files}
              stats={stats}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              loading={loading}
            />
          </div>

          {/* Center Panel: Diff Viewer */}
          <div className="h-full bloomberg-section">
            <DiffViewer
              diff={fileDiff}
              loading={loading && selectedFile !== null}
            />
          </div>

          {/* Right Panel: Controls */}
          <div className="h-full">
            <DiffControls
              normalizationOptions={normalizationOptions}
              onUpdateNormalization={updateNormalizationOptions}
              fileDiff={fileDiff}
              onCopyDiff={handleCopyDiff}
              onRefresh={handleRefresh}
              loading={loading}
            />
          </div>
        </Allotment>
      </div>

      {/* Bloomberg Terminal Status Bar */}
      <div className="flex-shrink-0 bloomberg-header border-t border-bloomberg-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>AUDIT</span>
            <span className="text-bloomberg-orange">│</span>
            {stats.total > 0 && (
              <>
                <span>{stats.different}/{stats.total} DIFFERENT</span>
                <span className="text-bloomberg-orange">│</span>
                <span className="text-bloomberg-green">{stats.identical} IDENTICAL</span>
                {stats.missingMiddleman > 0 && (
                  <>
                    <span className="text-bloomberg-orange">│</span>
                    <span className="text-bloomberg-muted">{stats.missingMiddleman} MM ONLY</span>
                  </>
                )}
                {stats.missingAstro > 0 && (
                  <>
                    <span className="text-bloomberg-orange">│</span>
                    <span className="text-bloomberg-muted">{stats.missingAstro} ASTRO ONLY</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedFile && (
              <>
                <span className="text-bloomberg-muted">{selectedFile}</span>
                <span className="text-bloomberg-orange">│</span>
              </>
            )}
            {fileDiff && (
              <>
                <span className={fileDiff.identical ? 'text-bloomberg-green' : 'text-bloomberg-red'}>
                  {fileDiff.identical ? 'IDENTICAL' : 'DIFFERENT'}
                </span>
                <span className="text-bloomberg-orange">│</span>
              </>
            )}
            <span className="text-bloomberg-muted">AUDIT LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}