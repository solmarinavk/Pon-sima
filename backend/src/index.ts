// ============================================
// MAIN API - Cloudflare Workers Entry Point
// ============================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import vocabRoutes from './routes/vocab';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import { getSession, getUserById } from './db/queries';
import { getSessionFromCookie } from './utils/auth';
// Progress routes will be imported in Phase 5

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
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware validates session and sets user context
// Auth routes (/api/auth/*) are excluded from this middleware
app.use('/api/*', async (c, next) => {
  // Skip auth check for auth routes
  if (c.req.path.startsWith('/api/auth')) {
    return next();
  }

  try {
    // Extract session cookie
    const cookieHeader = c.req.header('Cookie');
    const sessionId = getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    // Validate session
    const session = await getSession(c.env.DB, sessionId);

    if (!session) {
      return c.json({ success: false, error: 'Session expired or invalid' }, 401);
    }

    // Get user
    const user = await getUserById(c.env.DB, session.user_id);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 401);
    }

    // Check if user is active
    if (!user.is_active) {
      return c.json({ success: false, error: 'Account is inactive' }, 403);
    }

    // Set user context
    c.set('userId', user.id);
    c.set('userRole', user.role);
    c.set('user', user); // Store full user object for admin middleware

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 401);
  }
});

// ============================================
// ROUTES
// ============================================

// Auth routes (must be before middleware)
app.route('/api/auth', authRoutes);

// Admin routes (teacher-only, requires auth)
app.route('/api/admin', adminRoutes);

// Vocab routes
app.route('/api/vocab', vocabRoutes);

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
