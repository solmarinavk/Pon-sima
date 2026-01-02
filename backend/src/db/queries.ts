// ============================================
// DATABASE QUERIES - Type-safe D1 helpers for Spanish with Silvana
// ============================================

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: number;
  username: string; // Changed from email
  password_hash: string;
  name: string;
  role: 'student' | 'teacher';
  level?: string;
  student_group?: string;
  is_active: number;
  created_by?: number;
  total_points: number;
  current_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface VocabItem {
  id: number;
  spanish_word: string;
  english_translation: string;
  part_of_speech?: string;
  difficulty_level?: string;
  category?: string;
  notes?: string;
  image_url?: string;
  audio_url?: string;
  cultural_note?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface VocabExample {
  id: number;
  vocab_id: number;
  spanish_sentence: string;
  english_translation: string;
  context?: string;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  vocab_id: number;
  status: 'new' | 'learning' | 'learned' | 'difficult';
  times_reviewed: number;
  times_correct: number;
  times_incorrect: number;
  next_review_date?: string;
  srs_interval: number;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  type: 'vocabulary' | 'quiz' | 'writing' | 'listening' | 'game';
  difficulty?: string;
  points: number;
  max_attempts: number;
  time_limit_minutes?: number;
  config?: string; // JSON
  due_date?: string;
  assigned_to: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  answers?: string; // JSON
  score?: number;
  completed: number;
  attempt_number: number;
  auto_feedback?: string;
  teacher_feedback?: string;
  started_at?: string;
  submitted_at?: string;
  graded_at?: string;
}

export interface Badge {
  id: number;
  user_id: number;
  badge_type: string;
  earned_at: string;
  displayed: number;
}

export interface GameScore {
  id: number;
  user_id: number;
  game_type: string;
  score: number;
  time_seconds?: number;
  accuracy?: number;
  played_at: string;
}

// ============================================
// USER QUERIES
// ============================================

export async function createUser(
  db: D1Database,
  username: string,
  passwordHash: string,
  name: string,
  role: 'student' | 'teacher',
  createdBy?: number,
  level?: string,
  studentGroup?: string
): Promise<User | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO users (username, password_hash, name, role, created_by, level, student_group)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
      )
      .bind(username, passwordHash, name, role, createdBy || null, level || 'beginner', studentGroup || null)
      .first<User>();
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const user = await db
    .prepare('SELECT * FROM users WHERE username = ? AND is_active = 1')
    .bind(username)
    .first<User>();
  return user;
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return user;
}

export async function getAllStudents(db: D1Database): Promise<User[]> {
  const result = await db
    .prepare('SELECT * FROM users WHERE role = ? AND is_active = 1 ORDER BY name')
    .bind('student')
    .all<User>();
  return result.results || [];
}

export async function updateUser(
  db: D1Database,
  id: number,
  data: Partial<User>
): Promise<User | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.level !== undefined) {
      fields.push('level = ?');
      values.push(data.level);
    }
    if (data.student_group !== undefined) {
      fields.push('student_group = ?');
      values.push(data.student_group);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING *`;
    const result = await db.prepare(sql).bind(...values).first<User>();
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function updateUserPoints(
  db: D1Database,
  userId: number,
  pointsToAdd: number
): Promise<void> {
  await db
    .prepare('UPDATE users SET total_points = total_points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(pointsToAdd, userId)
    .run();
}

export async function updateUserStreak(
  db: D1Database,
  userId: number
): Promise<void> {
  // Logic to calculate and update streak
  const user = await getUserById(db, userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const lastActivity = user.last_activity_date;

  let newStreak = user.current_streak;

  if (!lastActivity) {
    newStreak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivity === yesterdayStr) {
      newStreak += 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }
  }

  await db
    .prepare(
      'UPDATE users SET current_streak = ?, last_activity_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    .bind(newStreak, today, userId)
    .run();
}

// ============================================
// SESSION QUERIES
// ============================================

export async function createSession(
  db: D1Database,
  sessionId: string,
  userId: number,
  expiresAt: string
): Promise<Session | null> {
  try {
    const result = await db
      .prepare(
        'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?) RETURNING *'
      )
      .bind(sessionId, userId, expiresAt)
      .first<Session>();
    return result;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function getSession(db: D1Database, sessionId: string): Promise<Session | null> {
  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")')
    .bind(sessionId)
    .first<Session>();
  return session;
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<boolean> {
  try {
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

export async function cleanExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE expires_at <= datetime("now")').run();
}

// ============================================
// VOCAB QUERIES
// ============================================

export async function createVocabItem(
  db: D1Database,
  data: {
    spanish_word: string;
    english_translation: string;
    part_of_speech?: string;
    difficulty_level?: string;
    category?: string;
    notes?: string;
    cultural_note?: string;
    created_by: number;
  }
): Promise<VocabItem | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO vocab_items
        (spanish_word, english_translation, part_of_speech, difficulty_level, category, notes, cultural_note, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        data.spanish_word,
        data.english_translation,
        data.part_of_speech || null,
        data.difficulty_level || null,
        data.category || null,
        data.notes || null,
        data.cultural_note || null,
        data.created_by
      )
      .first<VocabItem>();
    return result;
  } catch (error) {
    console.error('Error creating vocab item:', error);
    return null;
  }
}

export async function getAllVocabItems(db: D1Database): Promise<VocabItem[]> {
  const result = await db
    .prepare('SELECT * FROM vocab_items ORDER BY created_at DESC')
    .all<VocabItem>();
  return result.results || [];
}

export async function getVocabItemById(db: D1Database, id: number): Promise<VocabItem | null> {
  const item = await db
    .prepare('SELECT * FROM vocab_items WHERE id = ?')
    .bind(id)
    .first<VocabItem>();
  return item;
}

export async function updateVocabItem(
  db: D1Database,
  id: number,
  data: Partial<VocabItem>
): Promise<VocabItem | null> {
  try {
    const result = await db
      .prepare(
        `UPDATE vocab_items
        SET spanish_word = COALESCE(?, spanish_word),
            english_translation = COALESCE(?, english_translation),
            part_of_speech = COALESCE(?, part_of_speech),
            difficulty_level = COALESCE(?, difficulty_level),
            category = COALESCE(?, category),
            notes = COALESCE(?, notes),
            cultural_note = COALESCE(?, cultural_note),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *`
      )
      .bind(
        data.spanish_word || null,
        data.english_translation || null,
        data.part_of_speech || null,
        data.difficulty_level || null,
        data.category || null,
        data.notes || null,
        data.cultural_note || null,
        id
      )
      .first<VocabItem>();
    return result;
  } catch (error) {
    console.error('Error updating vocab item:', error);
    return null;
  }
}

export async function deleteVocabItem(db: D1Database, id: number): Promise<boolean> {
  try {
    await db.prepare('DELETE FROM vocab_items WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Error deleting vocab item:', error);
    return false;
  }
}

// ============================================
// VOCAB EXAMPLES QUERIES
// ============================================

export async function createVocabExample(
  db: D1Database,
  data: {
    vocab_id: number;
    spanish_sentence: string;
    english_translation: string;
    context?: string;
  }
): Promise<VocabExample | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO vocab_examples
        (vocab_id, spanish_sentence, english_translation, context)
        VALUES (?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        data.vocab_id,
        data.spanish_sentence,
        data.english_translation,
        data.context || null
      )
      .first<VocabExample>();
    return result;
  } catch (error) {
    console.error('Error creating vocab example:', error);
    return null;
  }
}

export async function getExamplesByVocabId(
  db: D1Database,
  vocabId: number
): Promise<VocabExample[]> {
  const result = await db
    .prepare('SELECT * FROM vocab_examples WHERE vocab_id = ?')
    .bind(vocabId)
    .all<VocabExample>();
  return result.results || [];
}

// ============================================
// USER PROGRESS QUERIES
// ============================================

export async function getUserProgress(
  db: D1Database,
  userId: number
): Promise<UserProgress[]> {
  const result = await db
    .prepare('SELECT * FROM user_progress WHERE user_id = ?')
    .bind(userId)
    .all<UserProgress>();
  return result.results || [];
}

export async function getProgressByVocabId(
  db: D1Database,
  userId: number,
  vocabId: number
): Promise<UserProgress | null> {
  const progress = await db
    .prepare('SELECT * FROM user_progress WHERE user_id = ? AND vocab_id = ?')
    .bind(userId, vocabId)
    .first<UserProgress>();
  return progress;
}

export async function upsertUserProgress(
  db: D1Database,
  data: {
    user_id: number;
    vocab_id: number;
    status: 'new' | 'learning' | 'learned' | 'difficult';
    times_reviewed?: number;
    times_correct?: number;
    times_incorrect?: number;
  }
): Promise<UserProgress | null> {
  try {
    // Calculate next review date based on SRS
    const timesCorrect = data.times_correct || 0;
    const timesIncorrect = data.times_incorrect || 0;
    let srsInterval = 1;

    if (timesCorrect > timesIncorrect) {
      srsInterval = Math.min(30, Math.pow(2, timesCorrect - timesIncorrect));
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + srsInterval);
    const nextReviewStr = nextReview.toISOString().split('T')[0];

    const result = await db
      .prepare(
        `INSERT INTO user_progress
        (user_id, vocab_id, status, times_reviewed, times_correct, times_incorrect, srs_interval, next_review_date, last_reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, vocab_id) DO UPDATE SET
          status = excluded.status,
          times_reviewed = user_progress.times_reviewed + COALESCE(excluded.times_reviewed, 0),
          times_correct = user_progress.times_correct + COALESCE(excluded.times_correct, 0),
          times_incorrect = user_progress.times_incorrect + COALESCE(excluded.times_incorrect, 0),
          srs_interval = excluded.srs_interval,
          next_review_date = excluded.next_review_date,
          last_reviewed_at = datetime('now'),
          updated_at = datetime('now')
        RETURNING *`
      )
      .bind(
        data.user_id,
        data.vocab_id,
        data.status,
        data.times_reviewed || 0,
        data.times_correct || 0,
        data.times_incorrect || 0,
        srsInterval,
        nextReviewStr
      )
      .first<UserProgress>();
    return result;
  } catch (error) {
    console.error('Error upserting user progress:', error);
    return null;
  }
}

// ============================================
// ASSIGNMENT QUERIES
// ============================================

export async function createAssignment(
  db: D1Database,
  data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
): Promise<Assignment | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO assignments
        (title, description, type, difficulty, points, max_attempts, time_limit_minutes, config, due_date, assigned_to, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        data.title,
        data.description || null,
        data.type,
        data.difficulty || null,
        data.points,
        data.max_attempts,
        data.time_limit_minutes || null,
        data.config || null,
        data.due_date || null,
        data.assigned_to,
        data.created_by
      )
      .first<Assignment>();
    return result;
  } catch (error) {
    console.error('Error creating assignment:', error);
    return null;
  }
}

export async function getAllAssignments(db: D1Database): Promise<Assignment[]> {
  const result = await db
    .prepare('SELECT * FROM assignments ORDER BY due_date ASC')
    .all<Assignment>();
  return result.results || [];
}

export async function getAssignmentsForUser(
  db: D1Database,
  userId: number
): Promise<Assignment[]> {
  const result = await db
    .prepare(
      `SELECT * FROM assignments
       WHERE assigned_to = 'all' OR assigned_to LIKE ?
       ORDER BY due_date ASC`
    )
    .bind(`%"${userId}"%`)
    .all<Assignment>();
  return result.results || [];
}

// ============================================
// BADGE QUERIES
// ============================================

export async function awardBadge(
  db: D1Database,
  userId: number,
  badgeType: string
): Promise<Badge | null> {
  try {
    const result = await db
      .prepare(
        'INSERT INTO badges (user_id, badge_type) VALUES (?, ?) ON CONFLICT DO NOTHING RETURNING *'
      )
      .bind(userId, badgeType)
      .first<Badge>();
    return result;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return null;
  }
}

export async function getUserBadges(db: D1Database, userId: number): Promise<Badge[]> {
  const result = await db
    .prepare('SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC')
    .bind(userId)
    .all<Badge>();
  return result.results || [];
}

// ============================================
// GAME SCORE QUERIES
// ============================================

export async function saveGameScore(
  db: D1Database,
  data: Omit<GameScore, 'id' | 'played_at'>
): Promise<GameScore | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO game_scores (user_id, game_type, score, time_seconds, accuracy)
         VALUES (?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(data.user_id, data.game_type, data.score, data.time_seconds || null, data.accuracy || null)
      .first<GameScore>();
    return result;
  } catch (error) {
    console.error('Error saving game score:', error);
    return null;
  }
}

export async function getLeaderboard(
  db: D1Database,
  gameType: string,
  limit: number = 10
): Promise<any[]> {
  const result = await db
    .prepare(
      `SELECT gs.*, u.name, u.username
       FROM game_scores gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.game_type = ?
       ORDER BY gs.score DESC, gs.time_seconds ASC
       LIMIT ?`
    )
    .bind(gameType, limit)
    .all();
  return result.results || [];
}

// ============================================
// ANALYTICS QUERIES
// ============================================

export async function getMostDifficultWords(
  db: D1Database,
  limit: number = 10
): Promise<any[]> {
  const result = await db
    .prepare(
      `SELECT
        v.id,
        v.spanish_word,
        v.english_translation,
        COUNT(DISTINCT up.user_id) as students_struggling,
        AVG(up.times_incorrect) as avg_incorrect
      FROM vocab_items v
      LEFT JOIN user_progress up ON v.id = up.vocab_id
      WHERE up.status = 'difficult' OR up.times_incorrect > up.times_correct
      GROUP BY v.id
      ORDER BY students_struggling DESC, avg_incorrect DESC
      LIMIT ?`
    )
    .bind(limit)
    .all();
  return result.results || [];
}

export async function getStudentProgressSummary(
  db: D1Database,
  userId: number
): Promise<any> {
  const result = await db
    .prepare(
      `SELECT
        COUNT(*) as total_words,
        SUM(CASE WHEN status = 'learned' THEN 1 ELSE 0 END) as learned,
        SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning,
        SUM(CASE WHEN status = 'difficult' THEN 1 ELSE 0 END) as difficult,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_words,
        SUM(times_reviewed) as total_reviews,
        SUM(times_correct) as total_correct,
        SUM(times_incorrect) as total_incorrect
      FROM user_progress
      WHERE user_id = ?`
    )
    .bind(userId)
    .first();
  return result;
}
