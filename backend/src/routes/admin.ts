// ============================================
// ADMIN ROUTES - User management (Teacher only)
// ============================================

import { Hono } from 'hono';
import {
  createUser,
  getUserById,
  getUserByUsername,
  getAllUsers,
  updateUser,
  deleteUser as deleteUserQuery,
} from '../db/queries';
import {
  hashPassword,
  isValidPassword,
} from '../utils/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const admin = new Hono<{ Bindings: Bindings }>();

// Middleware to check if user is a teacher
const requireTeacher = async (c: any, next: any) => {
  const user = c.get('user');

  if (!user || user.role !== 'teacher') {
    return c.json({ success: false, error: 'Access denied. Teacher role required.' }, 403);
  }

  await next();
};

// Apply teacher middleware to all admin routes
admin.use('*', requireTeacher);

// ============================================
// POST /admin/users - Create new user (Teacher only)
// ============================================
admin.post('/users', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, name, role, level, studentGroup } = body;
    const teacherId = c.get('user').id;

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

    // Check if username already exists
    const existingUser = await getUserByUsername(c.env.DB, username);
    if (existingUser) {
      return c.json({ success: false, error: 'Username already taken' }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(
      c.env.DB,
      username,
      passwordHash,
      name,
      role,
      teacherId, // created_by = teacher who created this user
      level || 'beginner',
      studentGroup
    );

    if (!user) {
      return c.json({ success: false, error: 'Failed to create user' }, 500);
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'User created successfully',
        },
      },
      201
    );
  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

// ============================================
// POST /admin/users/bulk - Create multiple users at once
// ============================================
admin.post('/users/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const { users } = body;
    const teacherId = c.get('user').id;

    if (!Array.isArray(users) || users.length === 0) {
      return c.json({ success: false, error: 'Users array is required' }, 400);
    }

    const results = {
      created: [] as any[],
      failed: [] as any[],
    };

    for (const userData of users) {
      const { username, password, name, role, level, studentGroup } = userData;

      // Basic validation
      if (!username || !password || !name || !role) {
        results.failed.push({ username, error: 'Missing required fields' });
        continue;
      }

      if (username.length < 3) {
        results.failed.push({ username, error: 'Username too short' });
        continue;
      }

      if (!isValidPassword(password)) {
        results.failed.push({ username, error: 'Password too weak' });
        continue;
      }

      // Check if user exists
      const existingUser = await getUserByUsername(c.env.DB, username);
      if (existingUser) {
        results.failed.push({ username, error: 'Username already taken' });
        continue;
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await createUser(
        c.env.DB,
        username,
        passwordHash,
        name,
        role,
        teacherId,
        level || 'beginner',
        studentGroup
      );

      if (user) {
        const { password_hash, ...userWithoutPassword } = user;
        results.created.push(userWithoutPassword);
      } else {
        results.failed.push({ username, error: 'Failed to create user' });
      }
    }

    return c.json({
      success: true,
      data: {
        created: results.created.length,
        failed: results.failed.length,
        results,
      },
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    return c.json({ success: false, error: 'Bulk creation failed' }, 500);
  }
});

// ============================================
// GET /admin/users - Get all users
// ============================================
admin.get('/users', async (c) => {
  try {
    const includeInactive = c.req.query('includeInactive') === 'true';
    const role = c.req.query('role'); // Optional filter by role
    const studentGroup = c.req.query('studentGroup'); // Optional filter by group

    const users = await getAllUsers(c.env.DB);

    // Apply filters
    let filteredUsers = users;

    if (!includeInactive) {
      filteredUsers = filteredUsers.filter(u => u.is_active);
    }

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (studentGroup) {
      filteredUsers = filteredUsers.filter(u => u.student_group === studentGroup);
    }

    // Remove password hashes
    const usersWithoutPasswords = filteredUsers.map(({ password_hash, ...user }) => user);

    return c.json({
      success: true,
      data: usersWithoutPasswords,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// ============================================
// GET /admin/users/:id - Get single user
// ============================================
admin.get('/users/:id', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));

    if (isNaN(userId)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const user = await getUserById(c.env.DB, userId);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// ============================================
// PATCH /admin/users/:id - Update user
// ============================================
admin.patch('/users/:id', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(userId)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const user = await getUserById(c.env.DB, userId);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Prevent deactivating yourself
    if (body.is_active === false && userId === c.get('user').id) {
      return c.json({ success: false, error: 'Cannot deactivate your own account' }, 400);
    }

    // Update user
    const updatedUser = await updateUser(c.env.DB, userId, body);

    if (!updatedUser) {
      return c.json({ success: false, error: 'Failed to update user' }, 500);
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'User updated successfully',
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ success: false, error: 'Failed to update user' }, 500);
  }
});

// ============================================
// DELETE /admin/users/:id - Delete user (soft delete by deactivating)
// ============================================
admin.delete('/users/:id', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));

    if (isNaN(userId)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    // Prevent deleting yourself
    if (userId === c.get('user').id) {
      return c.json({ success: false, error: 'Cannot delete your own account' }, 400);
    }

    const user = await getUserById(c.env.DB, userId);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Soft delete by setting is_active to 0
    const updatedUser = await updateUser(c.env.DB, userId, { is_active: false });

    if (!updatedUser) {
      return c.json({ success: false, error: 'Failed to deactivate user' }, 500);
    }

    return c.json({
      success: true,
      data: { message: 'User deactivated successfully' },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ success: false, error: 'Failed to deactivate user' }, 500);
  }
});

// ============================================
// PATCH /admin/users/:id/password - Reset user password
// ============================================
admin.patch('/users/:id/password', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { newPassword } = body;

    if (isNaN(userId)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    if (!newPassword || !isValidPassword(newPassword)) {
      return c.json(
        { success: false, error: 'New password must be at least 8 characters' },
        400
      );
    }

    const user = await getUserById(c.env.DB, userId);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const updatedUser = await updateUser(c.env.DB, userId, { password_hash: passwordHash });

    if (!updatedUser) {
      return c.json({ success: false, error: 'Failed to update password' }, 500);
    }

    return c.json({
      success: true,
      data: { message: 'Password updated successfully' },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ success: false, error: 'Failed to reset password' }, 500);
  }
});

export default admin;
