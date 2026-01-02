# API Documentation - Vocab Platform

Base URL (local): `http://localhost:8787`
Base URL (production): `https://vocab-platform-api.YOUR_ACCOUNT.workers.dev`

## Authentication

All `/api/*` endpoints require authentication via session cookie (implemented in Phase 4).

For testing purposes, the stub middleware currently allows all requests with teacher permissions.

---

## Endpoints

### Health Check

#### GET `/`
Get API status and version

**Response:**
```json
{
  "service": "Vocab Platform API",
  "version": "1.0.0",
  "status": "healthy",
  "timestamp": "2026-01-02T10:00:00.000Z"
}
```

#### GET `/health`
Check database connectivity

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## Vocabulary Endpoints

### GET `/api/vocab`
Get all vocabulary items

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "spanish_word": "hola",
      "english_translation": "hello",
      "part_of_speech": "phrase",
      "difficulty_level": "beginner",
      "category": "greetings",
      "notes": null,
      "created_by": 1,
      "created_at": "2026-01-02 10:00:00",
      "updated_at": "2026-01-02 10:00:00"
    }
  ]
}
```

### GET `/api/vocab/:id`
Get single vocabulary item

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "spanish_word": "hola",
    "english_translation": "hello",
    ...
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Vocabulary item not found"
}
```

### POST `/api/vocab`
Create new vocabulary item (teacher only)

**Request:**
```json
{
  "spanish_word": "casa",
  "english_translation": "house",
  "part_of_speech": "noun",
  "difficulty_level": "beginner",
  "category": "places",
  "notes": "Common noun"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "spanish_word": "casa",
    ...
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Spanish word and English translation are required"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Only teachers can create vocabulary"
}
```

### PUT `/api/vocab/:id`
Update vocabulary item (teacher only)

**Request:**
```json
{
  "english_translation": "home",
  "notes": "Can also mean 'home'"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "spanish_word": "casa",
    "english_translation": "home",
    "notes": "Can also mean 'home'",
    ...
  }
}
```

### DELETE `/api/vocab/:id`
Delete vocabulary item (teacher only)

**Response:**
```json
{
  "success": true,
  "message": "Vocabulary item deleted"
}
```

---

## Examples Endpoints

### GET `/api/vocab/:id/examples`
Get all examples for a vocabulary item

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vocab_id": 1,
      "spanish_sentence": "¡Hola! ¿Cómo estás?",
      "english_translation": "Hello! How are you?",
      "context": "Common greeting",
      "created_at": "2026-01-02 10:00:00"
    }
  ]
}
```

### POST `/api/vocab/:id/examples`
Add example to vocabulary item (teacher only)

**Request:**
```json
{
  "spanish_sentence": "Mi casa es grande",
  "english_translation": "My house is big",
  "context": "Describing your home"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "vocab_id": 5,
    "spanish_sentence": "Mi casa es grande",
    ...
  }
}
```

---

## Analytics Endpoints (Teacher Only)

### GET `/api/vocab/analytics/difficult`
Get most difficult words based on student performance

**Query Parameters:**
- `limit` (optional): Number of words to return (default: 10)

**Example:** `/api/vocab/analytics/difficult?limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "spanish_word": "hermoso",
      "english_translation": "beautiful",
      "students_struggling": 5,
      "avg_incorrect": 3.2
    }
  ]
}
```

---

## Progress Endpoints (Phase 5)

*To be implemented in Phase 5*

- `GET /api/progress` - Get user's progress
- `POST /api/progress/:vocab_id` - Update progress for a word
- `GET /api/progress/summary` - Get progress summary

---

## Auth Endpoints (Phase 4)

*To be implemented in Phase 4*

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid ID"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only teachers can create vocabulary"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "path": "/api/invalid-route"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Testing with cURL

### Get all vocabulary
```bash
curl http://localhost:8787/api/vocab
```

### Create vocabulary (teacher)
```bash
curl -X POST http://localhost:8787/api/vocab \
  -H "Content-Type: application/json" \
  -d '{
    "spanish_word": "libro",
    "english_translation": "book",
    "part_of_speech": "noun",
    "difficulty_level": "beginner",
    "category": "objects"
  }'
```

### Get examples
```bash
curl http://localhost:8787/api/vocab/1/examples
```

### Get analytics
```bash
curl http://localhost:8787/api/vocab/analytics/difficult?limit=5
```

---

## Data Types

### Vocabulary Item
```typescript
interface VocabItem {
  id: number;
  spanish_word: string;
  english_translation: string;
  part_of_speech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}
```

### Example
```typescript
interface VocabExample {
  id: number;
  vocab_id: number;
  spanish_sentence: string;
  english_translation: string;
  context?: string;
  created_at: string;
}
```

### User Progress (Phase 5)
```typescript
interface UserProgress {
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
```
