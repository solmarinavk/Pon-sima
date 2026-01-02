// ============================================
// MANAGE VOCAB - Teacher page for CRUD operations
// ============================================

import { useState, useEffect } from 'react';
import { vocabAPI, VocabItem } from '../services/api';
import VocabCard from '../components/VocabCard';

export default function ManageVocab() {
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    spanish_word: '',
    english_translation: '',
    part_of_speech: '',
    difficulty_level: 'beginner',
    category: '',
    notes: '',
  });

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const items = await vocabAPI.getAll();
      setVocabItems(items);
      setError(null);
    } catch (err) {
      setError('Failed to load vocabulary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await vocabAPI.update(editingId, formData);
      } else {
        await vocabAPI.create(formData);
      }

      await loadVocabulary();
      resetForm();
    } catch (err) {
      alert('Failed to save vocabulary');
      console.error(err);
    }
  };

  const handleEdit = (vocab: VocabItem) => {
    setFormData({
      spanish_word: vocab.spanish_word,
      english_translation: vocab.english_translation,
      part_of_speech: vocab.part_of_speech || '',
      difficulty_level: vocab.difficulty_level || 'beginner',
      category: vocab.category || '',
      notes: vocab.notes || '',
    });
    setEditingId(vocab.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await vocabAPI.delete(id);
      await loadVocabulary();
    } catch (err) {
      alert('Failed to delete vocabulary');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      spanish_word: '',
      english_translation: '',
      part_of_speech: '',
      difficulty_level: 'beginner',
      category: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Vocabulary</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add New Word'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="vocab-form">
          <h2>{editingId ? 'Edit Vocabulary' : 'Add New Vocabulary'}</h2>

          <div className="form-group">
            <label htmlFor="spanish_word">Spanish Word *</label>
            <input
              type="text"
              id="spanish_word"
              required
              value={formData.spanish_word}
              onChange={(e) =>
                setFormData({ ...formData, spanish_word: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="english_translation">English Translation *</label>
            <input
              type="text"
              id="english_translation"
              required
              value={formData.english_translation}
              onChange={(e) =>
                setFormData({ ...formData, english_translation: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="part_of_speech">Part of Speech</label>
              <select
                id="part_of_speech"
                value={formData.part_of_speech}
                onChange={(e) =>
                  setFormData({ ...formData, part_of_speech: e.target.value })
                }
              >
                <option value="">Select...</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="phrase">Phrase</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty Level</label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty_level: e.target.value })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                placeholder="e.g. greetings, food"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Additional context or teaching notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="vocab-grid">
        {vocabItems.map((vocab) => (
          <VocabCard
            key={vocab.id}
            vocab={vocab}
            showActions
            onEdit={() => handleEdit(vocab)}
            onDelete={() => handleDelete(vocab.id)}
          />
        ))}
      </div>
    </div>
  );
}
