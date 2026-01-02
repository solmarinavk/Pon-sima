// ============================================
// MAIN API - Cloudflare Workers Entry Point
// ============================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import vocabRoutes from './routes/vocab';
// Auth and progress routes will be imported in later phases

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// MIDDLEWARE
// ============================================

// Logger
app.use('*', logger());

// CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (c) => {
  return c.json({
    service: 'Vocab Platform API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    database: c.env.DB ? 'connected' : 'not configured',
  });
});

// ============================================
// AUTHENTICATION MIDDLEWARE (Stub for Phase 4)
// ============================================
// This middleware will be fully implemented in Phase 4
// For now, it's a placeholder to allow vocab routes to work
app.use('/api/*', async (c, next) => {
  // TODO: In Phase 4, implement:
  // 1. Extract session cookie
  // 2. Validate session
  // 3. Set userId and userRole in context

  // Temporary stub - allows all requests
  // In production, this should validate sessions
  c.set('userId', 1); // Demo teacher ID
  c.set('userRole', 'teacher'); // Demo role

  await next();
});

// ============================================
// ROUTES
// ============================================

// Vocab routes
app.route('/api/vocab', vocabRoutes);

// Auth routes (Phase 4)
// app.route('/api/auth', authRoutes);

// Progress routes (Phase 5)
// app.route('/api/progress', progressRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    path: c.req.path,
  }, 404);
});

// ============================================
// EXPORT
// ============================================
export default app;
