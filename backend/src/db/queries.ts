// ============================================
// DATABASE QUERIES - Type-safe D1 helpers
// ============================================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'student' | 'teacher';
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
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// USER QUERIES
// ============================================

export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  name: string,
  role: 'student' | 'teacher'
): Promise<User | null> {
  try {
    const result = await db
      .prepare(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?) RETURNING *'
      )
      .bind(email, passwordHash, name, role)
      .first<User>();
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const user = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
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
    created_by: number;
  }
): Promise<VocabItem | null> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO vocab_items
        (spanish_word, english_translation, part_of_speech, difficulty_level, category, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        data.spanish_word,
        data.english_translation,
        data.part_of_speech || null,
        data.difficulty_level || null,
        data.category || null,
        data.notes || null,
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
    const result = await db
      .prepare(
        `INSERT INTO user_progress
        (user_id, vocab_id, status, times_reviewed, times_correct, times_incorrect, last_reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, vocab_id) DO UPDATE SET
          status = excluded.status,
          times_reviewed = user_progress.times_reviewed + COALESCE(excluded.times_reviewed, 0),
          times_correct = user_progress.times_correct + COALESCE(excluded.times_correct, 0),
          times_incorrect = user_progress.times_incorrect + COALESCE(excluded.times_incorrect, 0),
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
        data.times_incorrect || 0
      )
      .first<UserProgress>();
    return result;
  } catch (error) {
    console.error('Error upserting user progress:', error);
    return null;
  }
}

// ============================================
// ANALYTICS QUERIES (for teacher dashboard)
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
