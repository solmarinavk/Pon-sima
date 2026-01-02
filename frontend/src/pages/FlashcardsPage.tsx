// ============================================
// FLASHCARDS PAGE - Practice vocabulary
// ============================================

import { useState, useEffect } from 'react';
import { vocabAPI, VocabItem } from '../services/api';
import Flashcard from '../components/Flashcard';

export default function FlashcardsPage() {
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const items = await vocabAPI.getAll();
      // Shuffle vocabulary for varied practice
      const shuffled = items.sort(() => Math.random() - 0.5);
      setVocabItems(shuffled);
      setError(null);
    } catch (err) {
      setError('Failed to load vocabulary. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkStatus = (status: 'new' | 'learning' | 'learned' | 'difficult') => {
    console.log(`Marked ${vocabItems[currentIndex].spanish_word} as ${status}`);
    // TODO: In Phase 5, this will call progressAPI.updateProgress()
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompleted(false);
    // Re-shuffle
    const shuffled = [...vocabItems].sort(() => Math.random() - 0.5);
    setVocabItems(shuffled);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading flashcards...</div>
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

  if (vocabItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>No vocabulary available</h2>
          <p>Ask your teacher to add some vocabulary first.</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="page-container">
        <div className="completion-screen">
          <h1>Session Complete!</h1>
          <p>You reviewed {vocabItems.length} words</p>
          <div className="completion-actions">
            <button onClick={handleRestart} className="btn-primary btn-large">
              Start New Session
            </button>
            <button
              onClick={() => window.location.href = '/progress'}
              className="btn-secondary btn-large"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVocab = vocabItems[currentIndex];

  return (
    <div className="page-container flashcards-page">
      <div className="page-header">
        <h1>Flashcards</h1>
        <p className="subtitle">
          Card {currentIndex + 1} of {vocabItems.length}
        </p>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / vocabItems.length) * 100}%` }}
        />
      </div>

      <Flashcard vocab={currentVocab} onMarkStatus={handleMarkStatus} />

      <div className="flashcard-navigation">
        <button
          onClick={handlePrevious}
          className="btn-secondary"
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        <button onClick={handleNext} className="btn-primary">
          {currentIndex === vocabItems.length - 1 ? 'Finish' : 'Skip'}
        </button>
      </div>
    </div>
  );
}
