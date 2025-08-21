import express from 'express';
import { commandExecutor } from '../utils/CommandExecutor';
import { TerminalOutput } from '../types';

const router = express.Router();

// GET /api/terminal/output - Get terminal output since a given timestamp
router.get('/output', (req, res) => {
  const since = parseInt(req.query.since as string) || 0;
  
  try {
    const result = commandExecutor.getOutputSince(since);
    
    const response: TerminalOutput = {
      since: Date.now(),
      lines: result.lines,
      hasMore: result.hasMore,
      status: result.status
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting terminal output:', error);
    res.status(500).json({ error: 'Failed to get terminal output' });
  }
});

// POST /api/terminal/clear - Clear terminal output
router.post('/clear', (req, res) => {
  try {
    commandExecutor.clear();
    res.json({ success: true, message: 'Terminal cleared' });
  } catch (error) {
    console.error('Error clearing terminal:', error);
    res.status(500).json({ error: 'Failed to clear terminal' });
  }
});

// GET /api/terminal/status - Get current terminal status
router.get('/status', (req, res) => {
  try {
    const status = commandExecutor.getStatus();
    res.json({ status });
  } catch (error) {
    console.error('Error getting terminal status:', error);
    res.status(500).json({ error: 'Failed to get terminal status' });
  }
});

export default router;