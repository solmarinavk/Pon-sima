-- ============================================
-- VOCAB PLATFORM - DATABASE SCHEMA (D1/SQLite)
-- ============================================

-- Drop existing tables (if re-running)
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS vocab_examples;
DROP TABLE IF EXISTS vocab_items;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

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
-- USER PROGRESS TABLE
-- ============================================
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vocab_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('new', 'learning', 'learned', 'difficult')),
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
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
CREATE INDEX idx_progress_last_reviewed ON user_progress(last_reviewed_at);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert a demo teacher (password: "teacher123")
-- Password hash generated with bcrypt
INSERT INTO users (email, password_hash, name, role) VALUES
('teacher@demo.com', '$2a$10$YourHashHere', 'Demo Teacher', 'teacher');

-- Insert a demo student (password: "student123")
INSERT INTO users (email, password_hash, name, role) VALUES
('student@demo.com', '$2a$10$YourHashHere', 'Demo Student', 'student');

-- Insert sample vocabulary (created by teacher with id=1)
INSERT INTO vocab_items (spanish_word, english_translation, part_of_speech, difficulty_level, category, created_by) VALUES
('hola', 'hello', 'phrase', 'beginner', 'greetings', 1),
('adiós', 'goodbye', 'phrase', 'beginner', 'greetings', 1),
('gracias', 'thank you', 'phrase', 'beginner', 'courtesy', 1),
('por favor', 'please', 'phrase', 'beginner', 'courtesy', 1),
('casa', 'house', 'noun', 'beginner', 'places', 1),
('libro', 'book', 'noun', 'beginner', 'objects', 1),
('comer', 'to eat', 'verb', 'beginner', 'actions', 1),
('estudiar', 'to study', 'verb', 'beginner', 'actions', 1),
('hermoso', 'beautiful', 'adjective', 'intermediate', 'descriptions', 1),
('rápido', 'fast/quick', 'adjective', 'beginner', 'descriptions', 1);

-- Insert example sentences
INSERT INTO vocab_examples (vocab_id, spanish_sentence, english_translation, context) VALUES
(1, '¡Hola! ¿Cómo estás?', 'Hello! How are you?', 'Common greeting'),
(3, 'Gracias por tu ayuda', 'Thank you for your help', 'Expressing gratitude'),
(5, 'Mi casa es grande', 'My house is big', 'Describing location'),
(7, 'Me gusta comer pizza', 'I like to eat pizza', 'Expressing preferences'),
(9, 'El paisaje es hermoso', 'The landscape is beautiful', 'Describing scenery');
