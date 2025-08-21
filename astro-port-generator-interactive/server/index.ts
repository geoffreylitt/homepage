import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Import API routes
import generatorAPI from './api/generator';
import fileSystemAPI from './api/fileSystem';
import devServerAPI from './api/devServer';
import terminalAPI from './api/terminal';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/generator', generatorAPI);
app.use('/api/filesystem', fileSystemAPI);
app.use('/api/devserver', devServerAPI);
app.use('/api/terminal', terminalAPI);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Working directory: ${process.cwd()}`);
});