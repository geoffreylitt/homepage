import { spawn, SpawnOptions } from 'child_process';
import { TerminalLine } from '../types';

/**
 * CommandExecutor - Intercepts and logs all shell commands for transparency
 * 
 * This class wraps child_process operations to provide:
 * - Real-time command output capture
 * - Pollable output buffer
 * - Command history tracking
 */
export class CommandExecutor {
  private static instance: CommandExecutor;
  private outputBuffer: TerminalLine[] = [];
  private status: 'idle' | 'running' | 'completed' | 'error' = 'idle';
  
  private constructor() {}
  
  static getInstance(): CommandExecutor {
    if (!CommandExecutor.instance) {
      CommandExecutor.instance = new CommandExecutor();
    }
    return CommandExecutor.instance;
  }
  
  /**
   * Add a line to the terminal output buffer
   */
  private addLine(type: TerminalLine['type'], content: string) {
    const line: TerminalLine = {
      type,
      content: content.trim(),
      timestamp: Date.now()
    };
    
    this.outputBuffer.push(line);
    
    // Keep buffer size manageable (last 1000 lines)
    if (this.outputBuffer.length > 1000) {
      this.outputBuffer = this.outputBuffer.slice(-1000);
    }
  }
  
  /**
   * Execute a command asynchronously (replacement for execSync)
   */
  async execSync(command: string, options: any = {}): Promise<string> {
    this.addLine('command', `$ ${command}`);
    this.status = 'running';
    
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      const child = exec(command, { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        ...options 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data: string) => {
        const output = data.toString();
        stdout += output;
        
        // Add each line to terminal in real-time
        output.trim().split('\n').forEach(line => {
          if (line.trim()) {
            this.addLine('stdout', line);
          }
        });
      });
      
      child.stderr?.on('data', (data: string) => {
        const output = data.toString();
        stderr += output;
        
        // Add each line to terminal in real-time
        output.trim().split('\n').forEach(line => {
          if (line.trim()) {
            this.addLine('stderr', line);
          }
        });
      });
      
      child.on('close', (code: number) => {
        if (code === 0) {
          this.addLine('info', `✅ Command completed successfully`);
          resolve(stdout);
        } else {
          this.addLine('stderr', `❌ Command failed with exit code ${code}`);
          this.status = 'error';
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      child.on('error', (error: Error) => {
        this.addLine('stderr', `❌ Error: ${error.message}`);
        this.status = 'error';
        reject(error);
      });
    });
  }
  
  /**
   * Execute a command asynchronously (replacement for spawn)
   */
  async spawn(command: string, args: string[] = [], options: SpawnOptions = {}): Promise<{ stdout: string, stderr: string }> {
    const fullCommand = `${command} ${args.join(' ')}`;
    this.addLine('command', `$ ${fullCommand}`);
    this.status = 'running';
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, options);
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Add each line to terminal
        output.trim().split('\n').forEach(line => {
          if (line.trim()) {
            this.addLine('stdout', line);
          }
        });
      });
      
      child.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        
        // Add each line to terminal
        output.trim().split('\n').forEach(line => {
          if (line.trim()) {
            this.addLine('stderr', line);
          }
        });
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          this.addLine('info', `✅ Command completed successfully`);
          this.status = 'completed';
          resolve({ stdout, stderr });
        } else {
          this.addLine('stderr', `❌ Command failed with exit code ${code}`);
          this.status = 'error';
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        this.addLine('stderr', `❌ Error: ${error.message}`);
        this.status = 'error';
        reject(error);
      });
    });
  }
  
  /**
   * Get terminal output since a given timestamp
   */
  getOutputSince(since: number = 0): {
    lines: TerminalLine[];
    hasMore: boolean;
    status: typeof this.status;
  } {
    const lines = this.outputBuffer.filter(line => line.timestamp > since);
    
    return {
      lines,
      hasMore: false, // For now, we return all matching lines
      status: this.status
    };
  }
  
  /**
   * Clear the output buffer
   */
  clear() {
    this.outputBuffer = [];
    this.status = 'idle';
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return this.status;
  }
  
  /**
   * Set status manually (useful for stage management)
   */
  setStatus(status: typeof this.status) {
    this.status = status;
  }
  
  /**
   * Add an info message
   */
  addInfo(message: string) {
    this.addLine('info', message);
  }
}

// Export singleton instance
export const commandExecutor = CommandExecutor.getInstance();