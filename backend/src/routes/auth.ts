// ============================================
// AUTH ROUTES - Registration, login, logout
// ============================================

import { Hono } from 'hono';
import {
  createUser,
  getUserByUsername,
  getUserById,
  createSession,
  getSession,
  deleteSession,
  cleanExpiredSessions,
} from '../db/queries';
import {
  hashPassword,
  verifyPassword,
  generateSessionId,
  getSessionExpiry,
  createSessionCookie,
  getSessionFromCookie,
  clearSessionCookie,
  isValidPassword,
} from '../utils/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

// ============================================
// POST /auth/register - Register new user
// ============================================
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, name, role, level, studentGroup } = body;

    // Validation
    if (!username || !password || !name || !role) {
      return c.json(
        { success: false, error: 'Username, password, name, and role are required' },
        400
      );
    }

    if (username.length < 3) {
      return c.json({ success: false, error: 'Username must be at least 3 characters' }, 400);
    }

    if (!isValidPassword(password)) {
      return c.json(
        { success: false, error: 'Password must be at least 8 characters' },
        400
      );
    }

    if (role !== 'student' && role !== 'teacher') {
      return c.json(
        { success: false, error: 'Role must be either "student" or "teacher"' },
        400
      );
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(c.env.DB, username);
    if (existingUser) {
      return c.json({ success: false, error: 'Username already taken' }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (with optional fields for students)
    const user = await createUser(
      c.env.DB,
      username,
      passwordHash,
      name,
      role,
      undefined, // createdBy will be set from admin route
      level,
      studentGroup
    );

    if (!user) {
      return c.json({ success: false, error: 'Failed to create user' }, 500);
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = getSessionExpiry();

    const session = await createSession(c.env.DB, sessionId, user.id, expiresAt);

    if (!session) {
      return c.json({ success: false, error: 'Failed to create session' }, 500);
    }

    // Set cookie
    c.header('Set-Cookie', createSessionCookie(sessionId));

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'Registration successful',
        },
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

// ============================================
// POST /auth/login - Login
// ============================================
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return c.json({ success: false, error: 'Username and password are required' }, 400);
    }

    // Get user
    const user = await getUserByUsername(c.env.DB, username);

    if (!user) {
      return c.json({ success: false, error: 'Invalid username or password' }, 401);
    }

    // Check if user is active
    if (!user.is_active) {
      return c.json({ success: false, error: 'Account is inactive. Contact your teacher.' }, 403);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return c.json({ success: false, error: 'Invalid username or password' }, 401);
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = getSessionExpiry();

    const session = await createSession(c.env.DB, sessionId, user.id, expiresAt);

    if (!session) {
      return c.json({ success: false, error: 'Failed to create session' }, 500);
    }

    // Clean expired sessions periodically
    await cleanExpiredSessions(c.env.DB);

    // Set cookie
    c.header('Set-Cookie', createSessionCookie(sessionId));

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'Login successful',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// ============================================
// POST /auth/logout - Logout
// ============================================
auth.post('/logout', async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionId = getSessionFromCookie(cookieHeader);

    if (sessionId) {
      await deleteSession(c.env.DB, sessionId);
    }

    // Clear cookie
    c.header('Set-Cookie', clearSessionCookie());

    return c.json({
      success: true,
      data: { message: 'Logout successful' },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

// ============================================
// GET /auth/me - Get current user
// ============================================
auth.get('/me', async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionId = getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    // Get session
    const session = await getSession(c.env.DB, sessionId);

    if (!session) {
      return c.json({ success: false, error: 'Session expired or invalid' }, 401);
    }

    // Get user
    const user = await getUserById(c.env.DB, session.user_id);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return c.json({ success: false, error: 'Failed to get user' }, 500);
  }
});

export default auth;
