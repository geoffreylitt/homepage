import express from 'express';
import { spawn, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { DevServerConfig } from '../types';

const router = express.Router();

// Dev server configurations
const DEV_SERVERS: { [key: string]: DevServerConfig } = {
  middleman: {
    name: 'Middleman',
    port: 4567, // Default port, will be updated from server output
    actualPort: undefined,
    command: 'bundle exec middleman server',
    cwd: '..',
    healthCheck: 'http://localhost:4567',
    process: null,
    status: 'stopped',
    output: []
  },
  astro: {
    name: 'Astro',
    port: 4321,
    command: 'npm run dev',
    cwd: '../astro-port-generated',
    healthCheck: 'http://localhost:4321',
    process: null,
    status: 'stopped',
    output: []
  }
};

// GET /api/devserver/status - Get status of all dev servers
router.get('/status', (req, res) => {
  const status = {};
  Object.keys(DEV_SERVERS).forEach(key => {
    const server = DEV_SERVERS[key];
    status[key] = {
      name: server.name,
      port: server.actualPort || server.port, // Use actual port if detected
      actualPort: server.actualPort,
      status: server.status,
      pid: server.process ? server.process.pid : null,
      output: server.output.slice(-10) // Last 10 log lines
    };
  });
  
  res.json(status);
});

// GET /api/devserver/:site/status - Get status of specific dev server
router.get('/:site/status', (req, res) => {
  const { site } = req.params;
  const server = DEV_SERVERS[site];
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  res.json({
    name: server.name,
    port: server.actualPort || server.port, // Use actual port if detected
    actualPort: server.actualPort,
    status: server.status,
    pid: server.process ? server.process.pid : null,
    output: server.output.slice(-20) // Last 20 log lines
  });
});

// POST /api/devserver/:site/start - Start a dev server
router.post('/:site/start', async (req, res) => {
  const { site } = req.params;
  const server = DEV_SERVERS[site];
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  if (server.status === 'running') {
    return res.status(409).json({ error: 'Server already running' });
  }

  try {
    // Check if directory exists
    const serverPath = path.resolve(server.cwd);
    if (!await fs.pathExists(serverPath)) {
      return res.status(404).json({ 
        error: `Server directory not found: ${serverPath}` 
      });
    }

    // Find an available port (try fallback ports for Astro)
    let actualPort = server.port;
    if (site === 'astro') {
      try {
        actualPort = await findAvailablePort(server.port);
        if (actualPort !== server.port) {
          console.log(`Port ${server.port} in use, using fallback port ${actualPort}`);
        }
      } catch (error) {
        return res.status(409).json({ 
          error: `No available ports found starting from ${server.port}` 
        });
      }
    } else {
      // For other servers (like Middleman), check the exact port
      const isPortFree = await checkPort(server.port);
      if (!isPortFree) {
        return res.status(409).json({ 
          error: `Port ${server.port} is already in use` 
        });
      }
    }

    // Start the server
    server.status = 'starting';
    server.output = [`Starting ${server.name} server...`];
    
    console.log(`Starting ${server.name} server in ${serverPath}`);
    
    // Split command into parts
    const commandParts = server.command.split(' ');
    const command = commandParts[0];
    const args = commandParts.slice(1);
    
    server.process = spawn(command, args, {
      cwd: serverPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: actualPort.toString() }
    });

    // Update server config with actual port being used
    server.actualPort = actualPort;
    server.healthCheck = `http://localhost:${actualPort}`;

    // Handle process output
    server.process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      server.output.push(`[stdout] ${output}`);
      if (server.output.length > 100) {
        server.output = server.output.slice(-50); // Keep last 50 lines
      }
      
      // Parse port from Middleman output
      if (site === 'middleman') {
        const middlemanPortMatch = output.match(/View your site at.*?:(\d+)/);
        if (middlemanPortMatch) {
          const actualPort = parseInt(middlemanPortMatch[1]);
          server.actualPort = actualPort;
          server.healthCheck = `http://localhost:${actualPort}`;
          console.log(`Detected Middleman running on port ${actualPort}`);
        }
      }
      
      // Parse port from Astro output  
      if (site === 'astro') {
        const astroPortMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
        if (astroPortMatch) {
          const actualPort = parseInt(astroPortMatch[1]);
          server.actualPort = actualPort;
          server.healthCheck = `http://localhost:${actualPort}`;
          console.log(`Detected Astro running on port ${actualPort}`);
        }
      }
      
      // Check for successful startup messages
      if (output.includes('Local:') || output.includes('serving at') || output.includes('ready') || output.includes('View your site at')) {
        server.status = 'running';
      }
    });

    server.process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      server.output.push(`[stderr] ${output}`);
      if (server.output.length > 100) {
        server.output = server.output.slice(-50);
      }
    });

    server.process.on('close', (code) => {
      console.log(`${server.name} server exited with code ${code}`);
      server.status = 'stopped';
      server.process = null;
      server.output.push(`Process exited with code ${code}`);
    });

    server.process.on('error', (error) => {
      console.error(`${server.name} server error:`, error);
      server.status = 'error';
      server.output.push(`Error: ${error.message}`);
    });

    // Give it a moment to start
    setTimeout(() => {
      if (server.status === 'starting') {
        server.status = 'running';
      }
    }, 5000);

    res.json({
      success: true,
      message: `${server.name} server starting on port ${actualPort}`,
      port: actualPort,
      pid: server.process.pid
    });

  } catch (error) {
    console.error(`Failed to start ${server.name} server:`, error);
    server.status = 'error';
    server.output.push(`Failed to start: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/devserver/:site/stop - Stop a dev server
router.post('/:site/stop', (req, res) => {
  const { site } = req.params;
  const server = DEV_SERVERS[site];
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  if (server.status === 'stopped') {
    return res.status(409).json({ error: 'Server already stopped' });
  }

  try {
    if (server.process) {
      server.process.kill('SIGTERM');
      server.status = 'stopping';
      server.output.push('Stopping server...');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (server.process && !server.process.killed) {
          server.process.kill('SIGKILL');
        }
      }, 5000);
    }

    res.json({
      success: true,
      message: `${server.name} server stopping`
    });

  } catch (error) {
    console.error(`Failed to stop ${server.name} server:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/devserver/:site/output - Get recent output from a dev server
router.get('/:site/output', (req, res) => {
  const { site } = req.params;
  const server = DEV_SERVERS[site];
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  res.json({
    output: server.output,
    status: server.status,
    timestamp: new Date().toISOString()
  });
});

// POST /api/devserver/:site/reset - Force reset server status
router.post('/:site/reset', (req, res) => {
  const { site } = req.params;
  const server = DEV_SERVERS[site];
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    // Force kill any existing process
    if (server.process) {
      try {
        server.process.kill('SIGKILL');
      } catch (error) {
        // Process may already be dead
      }
    }

    // Reset server state
    server.process = null;
    server.status = 'stopped';
    server.actualPort = undefined;
    server.output = ['Server status reset'];
    server.healthCheck = `http://localhost:${server.port}`;

    console.log(`${server.name} server status forcefully reset`);

    res.json({
      success: true,
      message: `${server.name} server status reset`,
      status: server.status
    });

  } catch (error) {
    console.error(`Failed to reset ${server.name} server:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to check if port is available
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port}`, (error, stdout) => {
      // If lsof returns nothing, port is free
      resolve(!stdout.trim());
    });
  });
}

// Helper function to find an available port starting from a base port
async function findAvailablePort(basePort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${basePort}`);
}

// Cleanup on process exit
process.on('exit', () => {
  Object.values(DEV_SERVERS).forEach(server => {
    if (server.process) {
      server.process.kill('SIGTERM');
    }
  });
});

process.on('SIGINT', () => {
  Object.values(DEV_SERVERS).forEach(server => {
    if (server.process) {
      server.process.kill('SIGTERM');
    }
  });
  process.exit(0);
});

export default router;