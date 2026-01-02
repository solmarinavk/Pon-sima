// ============================================
// WORD MATCH GAME - Match Spanish with English
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vocabAPI, progressAPI, VocabItem } from '../../services/api';

export default function WordMatchGame() {
  const navigate = useNavigate();
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [gameWords, setGameWords] = useState<VocabItem[]>([]);
  const [selectedSpanish, setSelectedSpanish] = useState<number | null>(null);
  const [selectedEnglish, setSelectedEnglish] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocab();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, timer]);

  const fetchVocab = async () => {
    try {
      const allVocab = await vocabAPI.getAll();
      setVocab(allVocab);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
      setLoading(false);
    }
  };

  const startGame = () => {
    // Select 8 random words
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);
    setGameWords(selected);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimer(60);
    setMatched(new Set());
    setSelectedSpanish(null);
    setSelectedEnglish(null);
  };

  const handleSpanishClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedSpanish(id);

    if (selectedEnglish !== null) {
      checkMatch(id, selectedEnglish);
    }
  };

  const handleEnglishClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedEnglish(id);

    if (selectedSpanish !== null) {
      checkMatch(selectedSpanish, id);
    }
  };

  const checkMatch = (spanishId: number, englishId: number) => {
    if (spanishId === englishId) {
      // Correct match!
      setMatched(new Set([...matched, spanishId]));
      setScore((prev) => prev + 100);
      setSelectedSpanish(null);
      setSelectedEnglish(null);

      // Check if game is won
      if (matched.size + 1 === gameWords.length) {
        endGame(true);
      }
    } else {
      // Wrong match
      setTimeout(() => {
        setSelectedSpanish(null);
        setSelectedEnglish(null);
      }, 500);
    }
  };

  const endGame = async (won: boolean) => {
    setGameOver(true);
    setGameStarted(false);

    // Calculate final score with time bonus
    let finalScore = score;
    if (won) {
      finalScore += timer * 10; // Time bonus
    }

    // Save score to backend
    try {
      await progressAPI.saveGameScore({
        game_type: 'word_match',
        score: finalScore,
        time_seconds: 60 - timer,
        difficulty: 'easy',
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  // Shuffle arrays for display
  const shuffledSpanish = [...gameWords].sort(() => Math.random() - 0.5);
  const shuffledEnglish = [...gameWords].sort(() => Math.random() - 0.5);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading game...</p>
      </div>
    );
  }

  if (!gameStarted && !gameOver) {
    return (
      <div className="page-container game-intro">
        <h1>🎯 Word Match</h1>
        <div className="game-intro-card">
          <p className="game-instructions">
            Match the Spanish words with their English translations as quickly as possible!
          </p>
          <ul className="game-rules">
            <li>⏱️ You have 60 seconds</li>
            <li>🎯 Match 8 word pairs</li>
            <li>⭐ Earn 100 points per match</li>
            <li>🔥 Time bonus at the end!</li>
          </ul>
          <button onClick={startGame} className="btn-primary btn-large">
            Start Game
          </button>
          <button onClick={() => navigate('/games')} className="btn-secondary">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const finalScore = score + (matched.size === gameWords.length ? timer * 10 : 0);
    return (
      <div className="page-container game-over">
        <div className="game-over-card">
          <h1>{matched.size === gameWords.length ? '🎉 You Won!' : '⏰ Time\'s Up!'}</h1>
          <div className="final-score">
            <div className="score-label">Final Score</div>
            <div className="score-value">{finalScore}</div>
          </div>
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Matched:</span>
              <span className="stat-value">{matched.size} / {gameWords.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time Taken:</span>
              <span className="stat-value">{60 - timer}s</span>
            </div>
          </div>
          <div className="game-over-actions">
            <button onClick={startGame} className="btn-primary">
              Play Again
            </button>
            <button onClick={() => navigate('/games')} className="btn-secondary">
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container game-active">
      <div className="game-header">
        <button onClick={() => navigate('/games')} className="btn-back">
          ← Back
        </button>
        <div className="game-stats-bar">
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">{timer}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-text">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-text">{matched.size}/{gameWords.length}</span>
          </div>
        </div>
      </div>

      <div className="match-container">
        <div className="words-column spanish-column">
          <h3>Spanish</h3>
          {shuffledSpanish.map((word) => (
            <button
              key={`spanish-${word.id}`}
              className={`word-card ${
                matched.has(word.id)
                  ? 'matched'
                  : selectedSpanish === word.id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleSpanishClick(word.id)}
              disabled={matched.has(word.id)}
            >
              {word.spanish_word}
            </button>
          ))}
        </div>

        <div className="words-column english-column">
          <h3>English</h3>
          {shuffledEnglish.map((word) => (
            <button
              key={`english-${word.id}`}
              className={`word-card ${
                matched.has(word.id)
                  ? 'matched'
                  : selectedEnglish === word.id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleEnglishClick(word.id)}
              disabled={matched.has(word.id)}
            >
              {word.english_translation}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .game-intro, .game-over, .game-active {
          max-width: 1200px;
          margin: 0 auto;
        }

        .game-intro-card, .game-over-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .game-instructions {
          font-size: 1.25rem;
          color: #374151;
          margin-bottom: 2rem;
        }

        .game-rules {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
        }

        .game-rules li {
          padding: 1rem;
          margin: 0.5rem 0;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 1.125rem;
        }

        .btn-large {
          padding: 1.25rem 3rem;
          font-size: 1.25rem;
          margin: 1rem 0.5rem;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-back {
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-back:hover {
          background: #4b5563;
        }

        .game-stats-bar {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .match-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .words-column {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .words-column h3 {
          text-align: center;
          margin-bottom: 1rem;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .spanish-column {
          border-top: 4px solid #3b82f6;
        }

        .english-column {
          border-top: 4px solid #10b981;
        }

        .word-card {
          width: 100%;
          padding: 1.25rem;
          margin: 0.5rem 0;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .word-card:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
          transform: scale(1.02);
        }

        .word-card.selected {
          background: #dbeafe;
          border-color: #3b82f6;
          transform: scale(1.05);
        }

        .word-card.matched {
          background: #d1fae5;
          border-color: #10b981;
          opacity: 0.6;
          cursor: not-allowed;
        }

        .final-score {
          margin: 2rem 0;
        }

        .score-label {
          font-size: 1.25rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .score-value {
          font-size: 4rem;
          font-weight: bold;
          color: #3b82f6;
        }

        .game-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin: 2rem 0;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
        }

        .game-over-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
