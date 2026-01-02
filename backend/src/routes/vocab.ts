// ============================================
// VOCAB ROUTES - Endpoints for vocabulary management
// ============================================

import { Hono } from 'hono';
import {
  createVocabItem,
  getAllVocabItems,
  getVocabItemById,
  updateVocabItem,
  deleteVocabItem,
  createVocabExample,
  getExamplesByVocabId,
  getMostDifficultWords,
} from '../db/queries';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const vocab = new Hono<{ Bindings: Bindings; Variables: { userId: number; userRole: string } }>();

// ============================================
// GET /vocab - Get all vocabulary items
// ============================================
vocab.get('/', async (c) => {
  try {
    const items = await getAllVocabItems(c.env.DB);
    return c.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching vocab items:', error);
    return c.json({ success: false, error: 'Failed to fetch vocabulary' }, 500);
  }
});

// ============================================
// GET /vocab/:id - Get single vocabulary item
// ============================================
vocab.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const item = await getVocabItemById(c.env.DB, id);
    if (!item) {
      return c.json({ success: false, error: 'Vocabulary item not found' }, 404);
    }

    return c.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching vocab item:', error);
    return c.json({ success: false, error: 'Failed to fetch vocabulary item' }, 500);
  }
});

// ============================================
// POST /vocab - Create new vocabulary item (teacher only)
// ============================================
vocab.post('/', async (c) => {
  try {
    // Check if user is teacher
    const userRole = c.get('userRole');
    if (userRole !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can create vocabulary' }, 403);
    }

    const body = await c.req.json();
    const { spanish_word, english_translation, part_of_speech, difficulty_level, category, notes } = body;

    // Validation
    if (!spanish_word || !english_translation) {
      return c.json({ success: false, error: 'Spanish word and English translation are required' }, 400);
    }

    const userId = c.get('userId');
    const item = await createVocabItem(c.env.DB, {
      spanish_word,
      english_translation,
      part_of_speech,
      difficulty_level,
      category,
      notes,
      created_by: userId,
    });

    if (!item) {
      return c.json({ success: false, error: 'Failed to create vocabulary item' }, 500);
    }

    return c.json({ success: true, data: item }, 201);
  } catch (error) {
    console.error('Error creating vocab item:', error);
    return c.json({ success: false, error: 'Failed to create vocabulary item' }, 500);
  }
});

// ============================================
// PUT /vocab/:id - Update vocabulary item (teacher only)
// ============================================
vocab.put('/:id', async (c) => {
  try {
    const userRole = c.get('userRole');
    if (userRole !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can update vocabulary' }, 403);
    }

    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const body = await c.req.json();
    const item = await updateVocabItem(c.env.DB, id, body);

    if (!item) {
      return c.json({ success: false, error: 'Vocabulary item not found or update failed' }, 404);
    }

    return c.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating vocab item:', error);
    return c.json({ success: false, error: 'Failed to update vocabulary item' }, 500);
  }
});

// ============================================
// DELETE /vocab/:id - Delete vocabulary item (teacher only)
// ============================================
vocab.delete('/:id', async (c) => {
  try {
    const userRole = c.get('userRole');
    if (userRole !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can delete vocabulary' }, 403);
    }

    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const success = await deleteVocabItem(c.env.DB, id);
    if (!success) {
      return c.json({ success: false, error: 'Failed to delete vocabulary item' }, 500);
    }

    return c.json({ success: true, message: 'Vocabulary item deleted' });
  } catch (error) {
    console.error('Error deleting vocab item:', error);
    return c.json({ success: false, error: 'Failed to delete vocabulary item' }, 500);
  }
});

// ============================================
// GET /vocab/:id/examples - Get examples for a vocab item
// ============================================
vocab.get('/:id/examples', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const examples = await getExamplesByVocabId(c.env.DB, id);
    return c.json({ success: true, data: examples });
  } catch (error) {
    console.error('Error fetching examples:', error);
    return c.json({ success: false, error: 'Failed to fetch examples' }, 500);
  }
});

// ============================================
// POST /vocab/:id/examples - Add example to vocab item (teacher only)
// ============================================
vocab.post('/:id/examples', async (c) => {
  try {
    const userRole = c.get('userRole');
    if (userRole !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can add examples' }, 403);
    }

    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid ID' }, 400);
    }

    const body = await c.req.json();
    const { spanish_sentence, english_translation, context } = body;

    if (!spanish_sentence || !english_translation) {
      return c.json({ success: false, error: 'Spanish and English sentences are required' }, 400);
    }

    const example = await createVocabExample(c.env.DB, {
      vocab_id: id,
      spanish_sentence,
      english_translation,
      context,
    });

    if (!example) {
      return c.json({ success: false, error: 'Failed to create example' }, 500);
    }

    return c.json({ success: true, data: example }, 201);
  } catch (error) {
    console.error('Error creating example:', error);
    return c.json({ success: false, error: 'Failed to create example' }, 500);
  }
});

// ============================================
// GET /vocab/analytics/difficult - Get most difficult words (teacher only)
// ============================================
vocab.get('/analytics/difficult', async (c) => {
  try {
    const userRole = c.get('userRole');
    if (userRole !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can access analytics' }, 403);
    }

    const limit = parseInt(c.req.query('limit') || '10');
    const words = await getMostDifficultWords(c.env.DB, limit);
    return c.json({ success: true, data: words });
  } catch (error) {
    console.error('Error fetching difficult words:', error);
    return c.json({ success: false, error: 'Failed to fetch analytics' }, 500);
  }
});

export default vocab;
