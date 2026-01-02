-- ============================================
-- SPANISH WITH SILVANA - DATABASE SCHEMA (D1/SQLite)
-- ============================================

-- Drop existing tables (if re-running)
DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS vocab_examples;
DROP TABLE IF EXISTS vocab_items;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE (Modified for username-based auth)
-- ============================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),

    -- Student metadata
    level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    student_group TEXT,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER, -- Teacher who created this user

    -- Gamification
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_date DATE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_by ON users(created_by);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- VOCAB ITEMS TABLE
-- ============================================
CREATE TABLE vocab_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spanish_word TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    part_of_speech TEXT CHECK(part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'other')),
    difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    notes TEXT,
    image_url TEXT,
    audio_url TEXT,
    cultural_note TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vocab_spanish ON vocab_items(spanish_word);
CREATE INDEX idx_vocab_difficulty ON vocab_items(difficulty_level);
CREATE INDEX idx_vocab_category ON vocab_items(category);
CREATE INDEX idx_vocab_created_by ON vocab_items(created_by);

-- ============================================
-- VOCAB EXAMPLES TABLE
-- ============================================
CREATE TABLE vocab_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocab_id INTEGER NOT NULL,
    spanish_sentence TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vocab_id) REFERENCES vocab_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_examples_vocab_id ON vocab_examples(vocab_id);

-- ============================================
-- USER PROGRESS TABLE (Enhanced with SRS)
-- ============================================
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vocab_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('new', 'learning', 'learned', 'difficult')),

    -- Spaced Repetition System
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    next_review_date DATE,
    srs_interval INTEGER DEFAULT 1, -- Days until next review

    last_reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocab_id) REFERENCES vocab_items(id) ON DELETE CASCADE,
    UNIQUE(user_id, vocab_id)
);

CREATE INDEX idx_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_progress_vocab_id ON user_progress(vocab_id);
CREATE INDEX idx_progress_status ON user_progress(status);
CREATE INDEX idx_progress_next_review ON user_progress(next_review_date);

-- ============================================
-- ASSIGNMENTS TABLE (Tasks/Homework)
-- ============================================
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('vocabulary', 'quiz', 'writing', 'listening', 'game')),
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),

    -- Assignment details
    points INTEGER DEFAULT 10,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER, -- NULL = no limit

    -- Configuration (JSON)
    config TEXT, -- Stores exercise-specific config

    -- Scheduling
    due_date DATETIME,
    assigned_to TEXT, -- 'all', 'group:name', or specific user_ids as JSON array

    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);
CREATE INDEX idx_assignments_type ON assignments(type);

-- ============================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    -- Submission data
    answers TEXT, -- JSON with user's answers
    score REAL, -- 0-100
    completed INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,

    -- Feedback
    auto_feedback TEXT, -- Automated feedback
    teacher_feedback TEXT, -- Silvana's comments

    started_at DATETIME,
    submitted_at DATETIME,
    graded_at DATETIME,

    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_user ON assignment_submissions(user_id);
CREATE INDEX idx_submissions_completed ON assignment_submissions(completed);

-- ============================================
-- BADGES TABLE (Achievements/Logros)
-- ============================================
CREATE TABLE badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_type TEXT NOT NULL,
    /* Badge types:
       - first_task
       - streak_7, streak_30
       - perfect_10, perfect_50
       - level_up
       - vocabulary_master_50, vocabulary_master_100
       - speed_demon
       - student_of_month
    */
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    displayed INTEGER DEFAULT 1, -- Show on profile?

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user ON badges(user_id);
CREATE INDEX idx_badges_type ON badges(badge_type);

-- ============================================
-- GAME SCORES TABLE (Mini-games leaderboard)
-- ============================================
CREATE TABLE game_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    /* Game types:
       - word_match
       - speed_quiz
       - sentence_builder
       - listening_challenge
       - daily_challenge
    */
    score INTEGER NOT NULL,
    time_seconds INTEGER,
    accuracy REAL, -- 0-100

    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_game_scores_user ON game_scores(user_id);
CREATE INDEX idx_game_scores_game ON game_scores(game_type);
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Silvana (teacher) with password "Panqueque"
INSERT INTO users (username, password_hash, name, role, is_active, created_by, total_points, current_streak) VALUES
('Silvana', 'algA/R0vn8JuBfrov5Sk4WGZAEZuKkl6x6BF21nvAGxuJ5a3J/R3BW1bG2lx4K+0', 'Silvana (Teacher)', 'teacher', 1, NULL, 0, 0);

-- Insert sample vocabulary (created by Silvana, id=1)
INSERT INTO vocab_items (spanish_word, english_translation, part_of_speech, difficulty_level, category, created_by, cultural_note) VALUES
('hola', 'hello', 'phrase', 'beginner', 'greetings', 1, 'Used at any time of day'),
('adiós', 'goodbye', 'phrase', 'beginner', 'greetings', 1, 'Formal goodbye'),
('gracias', 'thank you', 'phrase', 'beginner', 'courtesy', 1, 'Always appreciated!'),
('por favor', 'please', 'phrase', 'beginner', 'courtesy', 1, 'Essential for politeness'),
('casa', 'house', 'noun', 'beginner', 'places', 1, NULL),
('libro', 'book', 'noun', 'beginner', 'objects', 1, NULL),
('comer', 'to eat', 'verb', 'beginner', 'actions', 1, NULL),
('estudiar', 'to study', 'verb', 'beginner', 'actions', 1, NULL),
('hermoso', 'beautiful', 'adjective', 'intermediate', 'descriptions', 1, 'Can describe people, places, or things'),
('rápido', 'fast/quick', 'adjective', 'beginner', 'descriptions', 1, NULL),
('agua', 'water', 'noun', 'beginner', 'food', 1, NULL),
('amigo', 'friend', 'noun', 'beginner', 'people', 1, NULL),
('familia', 'family', 'noun', 'beginner', 'people', 1, NULL),
('escuela', 'school', 'noun', 'beginner', 'places', 1, NULL),
('ciudad', 'city', 'noun', 'beginner', 'places', 1, NULL);

-- Insert example sentences
INSERT INTO vocab_examples (vocab_id, spanish_sentence, english_translation, context) VALUES
(1, '¡Hola! ¿Cómo estás?', 'Hello! How are you?', 'Common greeting'),
(1, 'Hola, buenos días', 'Hello, good morning', 'Morning greeting'),
(3, 'Gracias por tu ayuda', 'Thank you for your help', 'Expressing gratitude'),
(3, 'Muchas gracias', 'Thank you very much', 'Emphatic thanks'),
(5, 'Mi casa es grande', 'My house is big', 'Describing location'),
(7, 'Me gusta comer pizza', 'I like to eat pizza', 'Expressing preferences'),
(9, 'El paisaje es hermoso', 'The landscape is beautiful', 'Describing scenery'),
(12, 'Mi mejor amigo se llama Carlos', 'My best friend is called Carlos', 'Talking about friends'),
(13, 'Mi familia es muy importante para mí', 'My family is very important to me', 'Expressing values');

-- Insert a sample assignment (Welcome task)
INSERT INTO assignments (title, description, type, difficulty, points, due_date, assigned_to, created_by, config) VALUES
('Bienvenida: Primeras 10 palabras',
 'Aprende estas 10 palabras básicas usando flashcards. ¡Es tu primera tarea!',
 'vocabulary',
 'beginner',
 50,
 datetime('now', '+7 days'),
 'all',
 1,
 '{"vocab_ids": [1,2,3,4,5,6,7,8,9,10], "min_correct": 8}');
