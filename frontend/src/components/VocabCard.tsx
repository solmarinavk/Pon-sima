// ============================================
// VOCAB CARD - Display single vocabulary item
// ============================================

import { VocabItem } from '../services/api';

interface VocabCardProps {
  vocab: VocabItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function VocabCard({
  vocab,
  onClick,
  onEdit,
  onDelete,
  showActions = false
}: VocabCardProps) {
  return (
    <div
      className="vocab-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="vocab-card-header">
        <h3 className="spanish-word">{vocab.spanish_word}</h3>
        {vocab.difficulty_level && (
          <span className={`badge badge-${vocab.difficulty_level}`}>
            {vocab.difficulty_level}
          </span>
        )}
      </div>

      <p className="english-translation">{vocab.english_translation}</p>

      {vocab.part_of_speech && (
        <span className="part-of-speech">{vocab.part_of_speech}</span>
      )}

      {vocab.category && (
        <span className="category">{vocab.category}</span>
      )}

      {vocab.notes && (
        <p className="notes">{vocab.notes}</p>
      )}

      {showActions && (
        <div className="vocab-card-actions">
          {onEdit && (
            <button
              className="btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${vocab.spanish_word}"?`)) {
                  onDelete();
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
