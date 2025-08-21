import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { Stage, StageStatus, StageOutputs } from '../types';
import { commandExecutor } from '../utils/CommandExecutor';

const router = express.Router();

// Port generation stages
const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Initialize Basic Site',
    description: 'Create Astro project with basic homepage, header, navigation, and profile photo',
    function: 'initializeBasicSite'
  },
  {
    id: 2,
    name: 'Add Core Styling',
    description: 'Copy SCSS files and apply the sites visual theme with full styling',
    function: 'addCoreStyling'
  },
  {
    id: 3,
    name: 'Setup Content Collections',
    description: 'Copy and transform blog posts and project pages',
    function: 'setupContentCollections'
  },
  {
    id: 4,
    name: 'Add Blog Listing',
    description: 'Display blog posts on homepage and create blog archive page',
    function: 'addBlogListing'
  },
  {
    id: 5,
    name: 'Add Project Grids',
    description: 'Display all project categories with grid layout on homepage',
    function: 'addProjectGrids'
  },
  {
    id: 6,
    name: 'Add Special Pages & Polish',
    description: 'Add inspirations page, RSS feed, 404 page, and remaining features',
    function: 'addSpecialPagesAndPolish'
  }
];

// Import the transparent generator functions
const generatorPath = path.resolve(__dirname, '..', '..', '..', 'astro-port-generator', 'generate-transparent.js');
let generator: any;

function loadGenerator() {
  try {
    console.log('Trying to load transparent generator from:', generatorPath);
    // Clear require cache to get fresh module
    delete require.cache[require.resolve(generatorPath)];
    generator = require(generatorPath);
    // Set up the command executor for transparency
    generator.setCommandExecutor(commandExecutor);
    console.log('Transparent generator loaded successfully');
    console.log('Available functions:', Object.keys(generator));
  } catch (error) {
    console.warn('Transparent generator module not found, using mock functions. Path tried:', generatorPath);
    console.warn('Error:', error.message);
    generator = createMockGenerator();
    console.log('Mock functions created:', Object.keys(generator));
  }
}

// Load generator on startup
loadGenerator();

// State file path
const STATE_FILE = path.resolve(__dirname, '..', '..', 'stage-state.json');

// State tracking
let currentStage: number = 0;
let stageStatus: StageStatus = {}; // { stageId: 'pending' | 'running' | 'completed' | 'error' }
let stageOutputs: StageOutputs = {}; // { stageId: [log messages] }

// Load persisted state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      currentStage = data.currentStage || 0;
      stageStatus = data.stageStatus || {};
      stageOutputs = data.stageOutputs || {};
      console.log('Loaded persisted stage state:', { currentStage, completedStages: Object.keys(stageStatus).filter(k => stageStatus[k] === 'completed') });
    } else {
      console.log('No persisted state found, starting fresh');
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }
}

// Save state to disk
function saveState() {
  try {
    const data = {
      currentStage,
      stageStatus,
      stageOutputs,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// Initialize stage status
function initializeStages() {
  STAGES.forEach(stage => {
    if (!stageStatus[stage.id]) {
      stageStatus[stage.id] = 'pending';
    }
    if (!stageOutputs[stage.id]) {
      stageOutputs[stage.id] = [];
    }
  });
}

// Load state on startup
loadState();
initializeStages();

// GET /api/generator/stages - Get all stages
router.get('/stages', (req, res) => {
  res.json({
    stages: STAGES,
    currentStage,
    status: stageStatus
  });
});

// GET /api/generator/status - Get current status
router.get('/status', (req, res) => {
  res.json({
    currentStage,
    status: stageStatus,
    outputs: stageOutputs
  });
});

// POST /api/generator/stages/:id/execute - Execute a specific stage
router.post('/stages/:id/execute', async (req, res) => {
  const stageId = parseInt(req.params.id);
  const stage = STAGES.find(s => s.id === stageId);
  
  if (!stage) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  // Check if already running
  if (stageStatus[stageId] === 'running') {
    return res.status(409).json({ error: 'Stage already running' });
  }

  try {
    // Update status
    stageStatus[stageId] = 'running';
    stageOutputs[stageId] = [];
    currentStage = stageId;
    saveState();

    // Execute the stage function
    console.log(`Executing stage ${stageId}: ${stage.name}`);
    
    const functionName = stage.function;
    if (generator[functionName]) {
      // Set terminal status to running
      commandExecutor.setStatus('running');
      commandExecutor.addInfo(`🚀 Starting ${stage.name}...`);
      
      // Change to the correct working directory (project root)
      const originalCwd = process.cwd();
      const projectRoot = path.resolve(__dirname, '..', '..', '..');
      console.log(`Changing working directory to: ${projectRoot}`);
      process.chdir(projectRoot);
      
      try {
        await generator[functionName]();
        stageStatus[stageId] = 'completed';
        stageOutputs[stageId].push(`✅ ${stage.name} completed successfully`);
        commandExecutor.setStatus('completed');
        commandExecutor.addInfo(`🎉 ${stage.name} completed successfully`);
        saveState();
      } finally {
        // Always restore the original working directory
        process.chdir(originalCwd);
      }
    } else {
      throw new Error(`Function ${functionName} not found`);
    }

    res.json({
      success: true,
      stage: stage,
      status: stageStatus[stageId],
      output: stageOutputs[stageId]
    });

  } catch (error) {
    console.error(`Stage ${stageId} failed:`, error);
    stageStatus[stageId] = 'error';
    stageOutputs[stageId].push(`❌ Error: ${error.message}`);
    commandExecutor.setStatus('error');
    commandExecutor.addInfo(`❌ ${stage.name} failed: ${error.message}`);
    saveState();
    
    res.status(500).json({
      success: false,
      error: error.message,
      stage: stage,
      status: stageStatus[stageId],
      output: stageOutputs[stageId]
    });
  }
});

// POST /api/generator/reset - Reset all stages and remove generated directory
router.post('/reset', async (req, res) => {
  try {
    // Clear terminal
    commandExecutor.clear();
    commandExecutor.addInfo('🔄 Resetting all stages and removing generated directory...');
    
    // Reset stage state
    currentStage = 0;
    STAGES.forEach(stage => {
      stageStatus[stage.id] = 'pending';
      stageOutputs[stage.id] = [];
    });
    saveState();

    // Remove astro-port-generated directory
    const astroPortDir = path.resolve(__dirname, '..', '..', '..', 'astro-port-generated');
    if (fs.existsSync(astroPortDir)) {
      console.log('Removing astro-port-generated directory...');
      commandExecutor.addInfo('Removing astro-port-generated directory...');
      await fs.promises.rm(astroPortDir, { recursive: true, force: true });
      console.log('astro-port-generated directory removed');
      commandExecutor.addInfo('✅ Directory removed successfully');
    }

    commandExecutor.addInfo('✅ Reset completed - ready to start fresh!');

    res.json({ 
      success: true, 
      message: 'All stages reset and generated directory removed' 
    });
  } catch (error) {
    console.error('Failed to reset:', error);
    commandExecutor.addInfo(`❌ Reset failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: `Failed to reset: ${error.message}`
    });
  }
});

// Mock generator functions for development
function createMockGenerator(): any {
  const mockFunctions: any = {};
  
  STAGES.forEach(stage => {
    mockFunctions[stage.function] = async (): Promise<void> => {
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      console.log(`Mock: ${stage.name} completed`);
    };
  });
  
  return mockFunctions;
}

export default router;