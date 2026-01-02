// ============================================
// FLASHCARD - Flip card for vocabulary practice
// ============================================

import { useState } from 'react';
import { VocabItem } from '../services/api';

interface FlashcardProps {
  vocab: VocabItem;
  onMarkStatus?: (status: 'new' | 'learning' | 'learned' | 'difficult') => void;
}

export default function Flashcard({ vocab, onMarkStatus }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkStatus = (status: 'new' | 'learning' | 'learned' | 'difficult') => {
    if (onMarkStatus) {
      onMarkStatus(status);
    }
    setIsFlipped(false);
  };

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-front">
          <h2>{vocab.spanish_word}</h2>
          {vocab.part_of_speech && (
            <p className="part-of-speech">{vocab.part_of_speech}</p>
          )}
          <p className="hint">Click to reveal translation</p>
        </div>

        <div className="flashcard-back">
          <h2>{vocab.english_translation}</h2>
          {vocab.category && (
            <p className="category">{vocab.category}</p>
          )}
          {vocab.notes && (
            <p className="notes">{vocab.notes}</p>
          )}
          <p className="hint">Click to flip back</p>
        </div>
      </div>

      {isFlipped && onMarkStatus && (
        <div className="flashcard-actions">
          <button
            className="btn-status status-difficult"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkStatus('difficult');
            }}
          >
            Difficult
          </button>
          <button
            className="btn-status status-learning"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkStatus('learning');
            }}
          >
            Learning
          </button>
          <button
            className="btn-status status-learned"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkStatus('learned');
            }}
          >
            Learned
          </button>
        </div>
      )}
    </div>
  );
}
