// Shared types for the frontend application

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

export interface DevServerStatus {
  name: string;
  port: number;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  pid?: number;
  output: string[];
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string | Date;
  children?: FileNode[];
}

export interface FileContent {
  content: string;
  path: string;
  extension: string;
  size: number;
  modified: string | Date;
}

export interface CorrespondingFile {
  sourcePath: string;
  targetPath: string;
  confidence: number;
  type: string;
  method: 'exact_pattern' | 'fuzzy_filename';
}

export interface WizardProps {
  currentStage: number;
  stageStatus: StageStatus;
  onStageComplete: () => void;
  onStageStart?: () => Promise<void>;
}

export interface PreviewPaneProps {
  site: string;
  linkMode: boolean;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  correspondingFile: string | null;
}

export interface IframePreviewProps {
  site: string;
  devServerStatus: string;
  linkMode: boolean;
}

export interface DevServerControlProps {
  site: string;
  onStatusChange: (status: string) => void;
}

export interface FileTreeProps {
  site: string;
  onFileClick: (filePath: string) => void;
  selectedFile: string | null;
  linkMode: boolean;
  correspondingFile: string | null;
}

export interface CodeViewerProps {
  content: string;
  filePath: string;
  extension: string;
}

export interface LinkModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
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