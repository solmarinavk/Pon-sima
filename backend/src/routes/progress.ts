// ============================================
// PROGRESS ROUTES - Gamification & Progress Tracking
// ============================================

import { Hono } from 'hono';
import {
  getUserProgress,
  getProgressSummary,
  upsertUserProgress,
  updateUserPoints,
  updateUserStreak,
  awardBadge,
  getUserBadges,
  saveGameScore,
  getLeaderboard,
  getUserById,
  getAllUsers,
} from '../db/queries';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const progress = new Hono<{ Bindings: Bindings }>();

// ============================================
// PROGRESS TRACKING
// ============================================

// GET /progress - Get my progress for all vocabulary
progress.get('/', async (c) => {
  try {
    const user = c.get('user');
    const userProgress = await getUserProgress(c.env.DB, user.id);

    return c.json({ success: true, data: userProgress });
  } catch (error) {
    console.error('Get progress error:', error);
    return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
  }
});

// GET /progress/summary - Get progress summary
progress.get('/summary', async (c) => {
  try {
    const user = c.get('user');
    const summary = await getProgressSummary(c.env.DB, user.id);

    return c.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get summary error:', error);
    return c.json({ success: false, error: 'Failed to fetch summary' }, 500);
  }
});

// POST /progress/:vocabId - Update progress for a vocabulary item
progress.post('/:vocabId', async (c) => {
  try {
    const user = c.get('user');
    const vocabId = parseInt(c.req.param('vocabId'));
    const body = await c.req.json();

    if (isNaN(vocabId)) {
      return c.json({ success: false, error: 'Invalid vocabulary ID' }, 400);
    }

    const { correct, difficulty } = body;

    // Update vocabulary progress with SRS
    const updatedProgress = await upsertUserProgress(
      c.env.DB,
      user.id,
      vocabId,
      correct ? 1 : 0
    );

    // Award points based on difficulty and correctness
    let points = 0;
    if (correct) {
      switch (difficulty) {
        case 'beginner':
          points = 5;
          break;
        case 'intermediate':
          points = 10;
          break;
        case 'advanced':
          points = 15;
          break;
        default:
          points = 5;
      }

      await updateUserPoints(c.env.DB, user.id, points);
      await updateUserStreak(c.env.DB, user.id);
    }

    // Check for badge achievements
    const summary = await getProgressSummary(c.env.DB, user.id);
    await checkAndAwardBadges(c.env.DB, user.id, summary);

    // Get updated user data
    const updatedUser = await getUserById(c.env.DB, user.id);

    return c.json({
      success: true,
      data: {
        progress: updatedProgress,
        points_earned: points,
        total_points: updatedUser?.total_points || 0,
        current_streak: updatedUser?.current_streak || 0,
      },
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return c.json({ success: false, error: 'Failed to update progress' }, 500);
  }
});

// ============================================
// BADGES
// ============================================

// GET /progress/badges - Get my badges
progress.get('/badges', async (c) => {
  try {
    const user = c.get('user');
    const badges = await getUserBadges(c.env.DB, user.id);

    return c.json({ success: true, data: badges });
  } catch (error) {
    console.error('Get badges error:', error);
    return c.json({ success: false, error: 'Failed to fetch badges' }, 500);
  }
});

// ============================================
// LEADERBOARDS
// ============================================

// GET /progress/leaderboard/points - Points leaderboard
progress.get('/leaderboard/points', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const users = await getAllUsers(c.env.DB);

    // Filter active users and sort by points
    const leaderboard = users
      .filter((u) => u.is_active && u.role === 'student')
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)
      .map((u, index) => ({
        rank: index + 1,
        user_id: u.id,
        username: u.username,
        name: u.name,
        total_points: u.total_points,
        current_streak: u.current_streak,
        level: u.level,
      }));

    return c.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// GET /progress/leaderboard/streaks - Streak leaderboard
progress.get('/leaderboard/streaks', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const users = await getAllUsers(c.env.DB);

    // Filter active users and sort by streak
    const leaderboard = users
      .filter((u) => u.is_active && u.role === 'student')
      .sort((a, b) => b.current_streak - a.current_streak)
      .slice(0, limit)
      .map((u, index) => ({
        rank: index + 1,
        user_id: u.id,
        username: u.username,
        name: u.name,
        current_streak: u.current_streak,
        total_points: u.total_points,
        level: u.level,
      }));

    return c.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Get streak leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// GET /progress/leaderboard/game/:gameType - Game-specific leaderboard
progress.get('/leaderboard/game/:gameType', async (c) => {
  try {
    const gameType = c.req.param('gameType');
    const limit = parseInt(c.req.query('limit') || '10');

    const leaderboard = await getLeaderboard(c.env.DB, gameType, limit);

    return c.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// ============================================
// GAME SCORES
// ============================================

// POST /progress/game-score - Save game score
progress.post('/game-score', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { game_type, score, time_seconds, difficulty, metadata } = body;

    if (!game_type || score === undefined) {
      return c.json({ success: false, error: 'Game type and score are required' }, 400);
    }

    const gameScore = await saveGameScore(c.env.DB, {
      user_id: user.id,
      game_type,
      score,
      time_seconds,
      difficulty,
      metadata,
    });

    // Award points based on game score
    const points = Math.floor(score / 10);
    await updateUserPoints(c.env.DB, user.id, points);

    const updatedUser = await getUserById(c.env.DB, user.id);

    return c.json({
      success: true,
      data: {
        game_score: gameScore,
        points_earned: points,
        total_points: updatedUser?.total_points || 0,
      },
    });
  } catch (error) {
    console.error('Save game score error:', error);
    return c.json({ success: false, error: 'Failed to save game score' }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkAndAwardBadges(db: D1Database, userId: number, summary: any) {
  const existingBadges = await getUserBadges(db, userId);
  const badgeTypes = existingBadges.map((b) => b.badge_type);

  // First Word badge
  if (summary.learned >= 1 && !badgeTypes.includes('first_word')) {
    await awardBadge(db, userId, 'first_word');
  }

  // Vocab Master badges
  if (summary.learned >= 10 && !badgeTypes.includes('vocab_10')) {
    await awardBadge(db, userId, 'vocab_10');
  }
  if (summary.learned >= 50 && !badgeTypes.includes('vocab_50')) {
    await awardBadge(db, userId, 'vocab_50');
  }
  if (summary.learned >= 100 && !badgeTypes.includes('vocab_100')) {
    await awardBadge(db, userId, 'vocab_100');
  }

  // Accuracy badge (80% correct)
  const accuracy =
    summary.total_reviews > 0 ? summary.total_correct / summary.total_reviews : 0;
  if (accuracy >= 0.8 && summary.total_reviews >= 20 && !badgeTypes.includes('accurate')) {
    await awardBadge(db, userId, 'accurate');
  }

  // Dedicated badge (10 reviews)
  if (summary.total_reviews >= 10 && !badgeTypes.includes('dedicated')) {
    await awardBadge(db, userId, 'dedicated');
  }
}

export default progress;
