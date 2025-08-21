import { useState, useEffect, useCallback } from 'react';

export interface NormalizationOptions {
  removeAssetVersions: boolean;
  normalizeCSSOrder: boolean;
  minifyHTML: boolean;
}

export const DEFAULT_NORMALIZATION_OPTIONS: NormalizationOptions = {
  removeAssetVersions: false,
  normalizeCSSOrder: false,
  minifyHTML: false,
};

export interface FileComparison {
  relativePath: string;
  status: 'identical' | 'different' | 'missing-middleman' | 'missing-astro';
}

export interface ComparisonStats {
  total: number;
  identical: number;
  different: number;
  missingMiddleman: number;
  missingAstro: number;
}

export interface FileDiff {
  file: string;
  identical: boolean;
  middlemanContent: string;
  astroContent: string;
  normalizedMiddleman: string;
  normalizedAstro: string;
  diff: string;
  rawDiff: string;
}

export interface BuildStatus {
  middleman: {
    exists: boolean;
    path: string;
    lastModified: string | null;
  };
  astro: {
    exists: boolean;
    path: string;
    lastModified: string | null;
  };
}

export function useAudit() {
  const [files, setFiles] = useState<FileComparison[]>([]);
  const [stats, setStats] = useState<ComparisonStats>({
    total: 0,
    identical: 0,
    different: 0,
    missingMiddleman: 0,
    missingAstro: 0,
  });
  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizationOptions, setNormalizationOptions] = useState<NormalizationOptions>(DEFAULT_NORMALIZATION_OPTIONS);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileDiff, setFileDiff] = useState<FileDiff | null>(null);
  
  // Check build status
  const checkBuildStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/audit/build-status');
      if (!response.ok) throw new Error('Failed to check build status');
      const status = await response.json();
      setBuildStatus(status);
      return status;
    } catch (err) {
      console.error('Error checking build status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check build status');
      return null;
    }
  }, []);
  
  // Load file list with current normalization options
  const loadFiles = useCallback(async (normalize: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        normalize: normalize.toString(),
      });
      
      if (normalize) {
        params.append('removeAssetVersions', normalizationOptions.removeAssetVersions.toString());
        params.append('normalizeCSSOrder', normalizationOptions.normalizeCSSOrder.toString());
        params.append('minifyHTML', normalizationOptions.minifyHTML.toString());
      }
      
      const response = await fetch(`/api/audit/files?${params}`);
      if (!response.ok) throw new Error('Failed to load files');
      
      const data = await response.json();
      setFiles(data.files);
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [normalizationOptions]);
  
  // Load detailed diff for a specific file
  const loadFileDiff = useCallback(async (filePath: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        removeAssetVersions: normalizationOptions.removeAssetVersions.toString(),
        normalizeCSSOrder: normalizationOptions.normalizeCSSOrder.toString(),
        minifyHTML: normalizationOptions.minifyHTML.toString(),
      });
      
      const response = await fetch(`/api/audit/compare/${encodeURIComponent(filePath)}?${params}`);
      if (!response.ok) throw new Error('Failed to load file diff');
      
      const data = await response.json();
      setFileDiff(data);
      setSelectedFile(filePath);
    } catch (err) {
      console.error('Error loading file diff:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file diff');
    } finally {
      setLoading(false);
    }
  }, [normalizationOptions]);
  
  // Update normalization options and reload files
  const updateNormalizationOptions = useCallback(async (newOptions: Partial<NormalizationOptions>) => {
    const updatedOptions = { ...normalizationOptions, ...newOptions };
    setNormalizationOptions(updatedOptions);
    
    // Reload files with new options
    await loadFiles(true);
    
    // If we have a selected file, reload its diff
    if (selectedFile) {
      await loadFileDiff(selectedFile);
    }
  }, [normalizationOptions, selectedFile, loadFiles, loadFileDiff]);
  
  // Generate copy-friendly diff text
  const generateCopyText = useCallback((diff: FileDiff): string => {
    const sections = [
      `File: ${diff.file}`,
      '',
      'MIDDLEMAN:',
      diff.middlemanContent,
      '',
      'ASTRO:',
      diff.astroContent,
      '',
      'NORMALIZED DIFF:',
      diff.diff,
      '',
      'RAW DIFF:',
      diff.rawDiff
    ];
    
    return sections.join('\n');
  }, []);
  
  // Copy diff to clipboard
  const copyDiffToClipboard = useCallback(async (diff: FileDiff): Promise<boolean> => {
    try {
      const text = generateCopyText(diff);
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }, [generateCopyText]);
  
  // Initialize on mount
  useEffect(() => {
    checkBuildStatus();
    loadFiles();
  }, [checkBuildStatus, loadFiles]);
  
  return {
    // Data
    files,
    stats,
    buildStatus,
    selectedFile,
    fileDiff,
    normalizationOptions,
    
    // State
    loading,
    error,
    
    // Actions
    loadFiles,
    loadFileDiff,
    updateNormalizationOptions,
    checkBuildStatus,
    copyDiffToClipboard,
    setSelectedFile,
    setError,
  };
}