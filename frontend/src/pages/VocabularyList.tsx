// ============================================
// VOCABULARY LIST - Browse all vocabulary
// ============================================

import { useState, useEffect } from 'react';
import { vocabAPI, VocabItem } from '../services/api';
import VocabCard from '../components/VocabCard';

export default function VocabularyList() {
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    category: '',
    difficulty: '',
    search: '',
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
      setError('Failed to load vocabulary. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVocab = vocabItems.filter((item) => {
    const matchesCategory = !filter.category || item.category === filter.category;
    const matchesDifficulty = !filter.difficulty || item.difficulty_level === filter.difficulty;
    const matchesSearch =
      !filter.search ||
      item.spanish_word.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.english_translation.toLowerCase().includes(filter.search.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const categories = [...new Set(vocabItems.map((v) => v.category).filter(Boolean))];
  const difficulties = [...new Set(vocabItems.map((v) => v.difficulty_level).filter(Boolean))];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading vocabulary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadVocabulary} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Vocabulary</h1>
        <p className="subtitle">Browse and learn {vocabItems.length} Spanish words</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search vocabulary..."
          className="search-input"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />

        <select
          className="filter-select"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filter.difficulty}
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
        >
          <option value="">All Levels</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        <button
          className="btn-secondary"
          onClick={() => setFilter({ category: '', difficulty: '', search: '' })}
        >
          Clear Filters
        </button>
      </div>

      <div className="vocab-grid">
        {filteredVocab.length === 0 ? (
          <p className="no-results">No vocabulary found matching your filters.</p>
        ) : (
          filteredVocab.map((vocab) => (
            <VocabCard key={vocab.id} vocab={vocab} />
          ))
        )}
      </div>
    </div>
  );
}
