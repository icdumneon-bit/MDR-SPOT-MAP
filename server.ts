import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Path to persistent shared storage file
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'spot_map_shared_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface SharedDataStore {
  cases: any[];
  wards: any[];
  recommendations: Record<string, any>;
  customPathogens: any[];
  customSpecimens: any[];
  lastUpdated: number;
}

// In-memory cache for ultra-fast response
let dataStore: SharedDataStore = {
  cases: [],
  wards: [],
  recommendations: {},
  customPathogens: [],
  customSpecimens: [],
  lastUpdated: Date.now(),
};

import { getInitial12MonthsCases } from './src/data/fullYearData.ts';
import { INITIAL_WARDS, INITIAL_RECOMMENDATIONS } from './src/data/initialData.ts';

// Load saved data if present or pre-populate defaults
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.cases) && parsed.cases.length > 0) {
        dataStore = {
          ...parsed,
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
        console.log(`[Shared DB] Loaded ${dataStore.cases.length} cases from disk.`);
        return;
      }
    }
  } catch (err) {
    console.error('[Shared DB] Failed to load data from disk', err);
  }

  // Pre-seed with default 12-month cases (including authentic 50 cases in October 2568)
  try {
    const initialCases = getInitial12MonthsCases();
    dataStore = {
      cases: initialCases,
      wards: INITIAL_WARDS,
      recommendations: INITIAL_RECOMMENDATIONS,
      customPathogens: [],
      customSpecimens: [],
      lastUpdated: Date.now(),
    };
    persistDatabase();
    console.log(`[Shared DB] Pre-seeded shared database with ${initialCases.length} cases and ${INITIAL_WARDS.length} wards.`);
  } catch (e) {
    console.error('[Shared DB] Pre-seed error', e);
  }
};

const persistDatabase = () => {
  try {
    dataStore.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(dataStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Shared DB] Failed to save database to disk', err);
  }
};

loadDatabase();

// --------------------------------------------------------------------------
// API Endpoints for Collaborative Shared Editing (ทุกคนที่มีลิงก์แก้ไขได้)
// --------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    casesCount: dataStore.cases.length,
    wardsCount: dataStore.wards.length,
    mode: 'collaborative_editor',
  });
});

// GET /api/shared-data - Fetch all shared data (cases, wards, recommendations, custom tools)
app.get('/api/shared-data', (req, res) => {
  res.json(dataStore);
});

// POST /api/initialize - Initialize or bootstrap database if server is empty
app.post('/api/initialize', (req, res) => {
  const { cases, wards, recommendations, customPathogens, customSpecimens } = req.body;
  if (dataStore.cases.length === 0 && Array.isArray(cases) && cases.length > 0) {
    dataStore.cases = cases;
    if (Array.isArray(wards) && wards.length > 0) dataStore.wards = wards;
    if (recommendations) dataStore.recommendations = recommendations;
    if (Array.isArray(customPathogens)) dataStore.customPathogens = customPathogens;
    if (Array.isArray(customSpecimens)) dataStore.customSpecimens = customSpecimens;
    persistDatabase();
    console.log(`[Shared DB] Initialized with ${cases.length} cases.`);
  }
  res.json(dataStore);
});

// POST /api/cases - Add a new case
app.post('/api/cases', (req, res) => {
  const newCase = req.body;
  if (!newCase || !newCase.organism) {
    return res.status(400).json({ error: 'Missing required case fields' });
  }

  // Ensure ID
  if (!newCase.id) {
    newCase.id = `fy-${newCase.year || 2568}-m${newCase.month || 10}-c${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Prepend to cases list
  dataStore.cases = [newCase, ...dataStore.cases];
  persistDatabase();

  res.json({ success: true, case: newCase, lastUpdated: dataStore.lastUpdated });
});

// PUT /api/cases/:id - Update an existing case
app.put('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const idx = dataStore.cases.findIndex((c) => c.id === id);
  if (idx !== -1) {
    dataStore.cases[idx] = { ...dataStore.cases[idx], ...updatedData };
    persistDatabase();
    res.json({ success: true, case: dataStore.cases[idx], lastUpdated: dataStore.lastUpdated });
  } else {
    // If not found, add it
    const newCase = { ...updatedData, id };
    dataStore.cases = [newCase, ...dataStore.cases];
    persistDatabase();
    res.json({ success: true, case: newCase, lastUpdated: dataStore.lastUpdated });
  }
});

// DELETE /api/cases/:id - Delete a case
app.delete('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = dataStore.cases.length;
  dataStore.cases = dataStore.cases.filter((c) => c.id !== id);

  if (dataStore.cases.length !== initialLength) {
    persistDatabase();
    res.json({ success: true, deletedId: id, lastUpdated: dataStore.lastUpdated });
  } else {
    res.json({ success: false, message: 'Case not found', lastUpdated: dataStore.lastUpdated });
  }
});

// PUT /api/wards - Update wards configuration (e.g. customized +5 department names)
app.put('/api/wards', (req, res) => {
  const { wards } = req.body;
  if (Array.isArray(wards) && wards.length > 0) {
    dataStore.wards = wards;
    persistDatabase();
    res.json({ success: true, wards: dataStore.wards, lastUpdated: dataStore.lastUpdated });
  } else {
    res.status(400).json({ error: 'Invalid wards data' });
  }
});

// PUT /api/recommendations - Update ICN ward recommendations & notes
app.put('/api/recommendations', (req, res) => {
  const { recommendations } = req.body;
  if (recommendations && typeof recommendations === 'object') {
    dataStore.recommendations = { ...dataStore.recommendations, ...recommendations };
    persistDatabase();
    res.json({ success: true, recommendations: dataStore.recommendations, lastUpdated: dataStore.lastUpdated });
  } else {
    res.status(400).json({ error: 'Invalid recommendations data' });
  }
});

// POST /api/sync-all - Bulk overwrite or full sync from a client edit
app.post('/api/sync-all', (req, res) => {
  const { cases, wards, recommendations, customPathogens, customSpecimens } = req.body;
  if (Array.isArray(cases)) dataStore.cases = cases;
  if (Array.isArray(wards)) dataStore.wards = wards;
  if (recommendations) dataStore.recommendations = recommendations;
  if (Array.isArray(customPathogens)) dataStore.customPathogens = customPathogens;
  if (Array.isArray(customSpecimens)) dataStore.customSpecimens = customSpecimens;

  persistDatabase();
  res.json({ success: true, lastUpdated: dataStore.lastUpdated });
});

// POST /api/reset - Reset to initial state
app.post('/api/reset', (req, res) => {
  const { initialCases, initialWards, initialRecommendations } = req.body;
  if (Array.isArray(initialCases)) dataStore.cases = initialCases;
  if (Array.isArray(initialWards)) dataStore.wards = initialWards;
  if (initialRecommendations) dataStore.recommendations = initialRecommendations;

  persistDatabase();
  res.json({ success: true, lastUpdated: dataStore.lastUpdated });
});

// --------------------------------------------------------------------------
// Dev / Production Web Server
// --------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite middleware for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted for development.');
  } else {
    // Static file serving for production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Spot Map collaborative server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server', err);
});
