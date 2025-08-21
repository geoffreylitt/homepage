// Shared TypeScript types for the server

export interface Stage {
  id: number;
  name: string;
  description: string;
  function: string;
}

export interface StageStatus {
  [stageId: number]: 'pending' | 'running' | 'completed' | 'error';
}

export interface StageOutputs {
  [stageId: number]: string[];
}

export interface DevServerConfig {
  name: string;
  port: number;
  actualPort?: number; // Parsed from server output
  command: string;
  cwd: string;
  healthCheck: string;
  process: any;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  output: string[];
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number | undefined;
  modified: Date;
  children?: FileNode[];
}

export interface FileContent {
  content: string;
  path: string;
  extension: string;
  size: number;
  modified: Date;
}

export interface FileChange {
  path: string;
  type: 'file' | 'directory';
  action: 'modified' | 'created' | 'deleted';
  timestamp: Date;
}

export interface PathConfig {
  root: string;
  include: string[];
  exclude: string[];
}

export interface CorrespondingFile {
  sourcePath: string;
  targetPath: string;
  confidence: number;
  type: string;
  method: 'exact_pattern' | 'fuzzy_filename';
}

export interface TerminalLine {
  type: 'command' | 'stdout' | 'stderr' | 'info';
  content: string;
  timestamp: number;
}

export interface TerminalOutput {
  since: number;
  lines: TerminalLine[];
  hasMore: boolean;
  status: 'idle' | 'running' | 'completed' | 'error';
}