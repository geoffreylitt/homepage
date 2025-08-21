import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for tracking files created during each stage
 * @param {number} currentStage - Current stage number
 * @param {Object} stageStatus - Stage status object
 * @returns {Object} { newFiles, capturePreStageFiles, clearNewFiles }
 */
export const useStageFiles = (currentStage, stageStatus) => {
  const [newFiles, setNewFiles] = useState(new Set());
  const [preStageFiles, setPreStageFiles] = useState(new Set());
  const previousStageRef = useRef(null);

  // Get file tree for Astro site
  const fetchFileTree = async () => {
    try {
      console.log(`🔗 [useStageFiles] Fetching file tree from /api/filesystem/tree/astro`);
      const response = await fetch('/api/filesystem/tree/astro');
      console.log(`🔗 [useStageFiles] Response status: ${response.status}, ok: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔗 [useStageFiles] API response data:`, data);
        console.log(`🔗 [useStageFiles] data.tree:`, data.tree);
        console.log(`🔗 [useStageFiles] data.exists:`, data.exists);
        console.log(`🔗 [useStageFiles] data.rootPath:`, data.rootPath);
        return data.tree || [];
      } else {
        const errorData = await response.text();
        console.error(`🔗 [useStageFiles] API error response:`, errorData);
      }
    } catch (error) {
      console.error('🔗 [useStageFiles] Failed to fetch file tree:', error);
    }
    return [];
  };

  // Recursively collect all file paths from tree structure
  const collectFilePaths = (nodes, basePath = '') => {
    const paths = new Set();
    
    if (!nodes) return paths;
    
    for (const node of nodes) {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
      
      if (node.type === 'file') {
        paths.add(fullPath);
      }
      
      if (node.type === 'directory' && node.children) {
        const childPaths = collectFilePaths(node.children, fullPath);
        childPaths.forEach(path => paths.add(path));
      }
    }
    
    return paths;
  };

  // Capture files before stage execution
  const capturePreStageFiles = useCallback(async () => {
    console.log(`🔍 [useStageFiles] Capturing files before stage ${currentStage}`);
    const tree = await fetchFileTree();
    console.log(`🔍 [useStageFiles] Fetched tree:`, tree);
    const filePaths = collectFilePaths(tree);
    console.log(`🔍 [useStageFiles] Collected file paths:`, Array.from(filePaths));
    setPreStageFiles(filePaths);
    console.log(`✅ [useStageFiles] Captured ${filePaths.size} files before stage ${currentStage}`);
  }, [currentStage]);

  // Compare files after stage completion to find new ones
  const detectNewFiles = useCallback(async () => {
    console.log(`🔍 [useStageFiles] Detecting new files after stage ${currentStage}`);
    console.log(`🔍 [useStageFiles] Pre-stage files count: ${preStageFiles.size}`);
    console.log(`🔍 [useStageFiles] Pre-stage files:`, Array.from(preStageFiles));
    
    const tree = await fetchFileTree();
    const currentFilePaths = collectFilePaths(tree);
    console.log(`🔍 [useStageFiles] Current files count: ${currentFilePaths.size}`);
    console.log(`🔍 [useStageFiles] Current files:`, Array.from(currentFilePaths));
    
    const newFilePaths = new Set();
    currentFilePaths.forEach(path => {
      if (!preStageFiles.has(path)) {
        newFilePaths.add(path);
      }
    });
    
    console.log(`🟢 [useStageFiles] Found ${newFilePaths.size} new files in stage ${currentStage}:`, Array.from(newFilePaths));
    setNewFiles(newFilePaths);
  }, [preStageFiles, currentStage]);

  // Clear new files when changing stages
  const clearNewFiles = useCallback(() => {
    setNewFiles(new Set());
    setPreStageFiles(new Set());
  }, []);

  // Monitor stage changes - only clear when user manually navigates backwards
  useEffect(() => {
    console.log(`📍 [useStageFiles] Stage changed from ${previousStageRef.current} to ${currentStage}`);
    if (previousStageRef.current !== null && previousStageRef.current !== currentStage) {
      // Only clear if moving backwards or jumping to a different stage
      if (currentStage < previousStageRef.current || Math.abs(currentStage - previousStageRef.current) > 1) {
        console.log(`🧹 [useStageFiles] Clearing new files for stage navigation`);
        clearNewFiles();
      } else {
        console.log(`➡️ [useStageFiles] Stage advanced naturally, keeping new files highlighted`);
      }
      previousStageRef.current = currentStage;
    } else if (previousStageRef.current === null) {
      previousStageRef.current = currentStage;
    }
  }, [currentStage, clearNewFiles]);

  // Monitor stage completion to detect new files
  useEffect(() => {
    const currentStageStatus = stageStatus[currentStage];
    console.log(`📊 [useStageFiles] Stage ${currentStage} status: ${currentStageStatus}, preStageFiles.size: ${preStageFiles.size}`);
    
    if (currentStageStatus === 'completed' && preStageFiles.size > 0) {
      console.log(`⏱️ [useStageFiles] Stage ${currentStage} completed, detecting new files in 500ms...`);
      // Small delay to ensure files are written
      const timer = setTimeout(() => {
        detectNewFiles();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [stageStatus, currentStage, detectNewFiles, preStageFiles.size]);

  return {
    newFiles,
    capturePreStageFiles,
    clearNewFiles
  };
};