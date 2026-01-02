// ============================================
// SPEED QUIZ GAME - Timed vocabulary quiz
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vocabAPI, progressAPI, VocabItem } from '../../services/api';

interface Question {
  word: VocabItem;
  options: string[];
  correctAnswer: string;
}

export default function SpeedQuizGame() {
  const navigate = useNavigate();
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    fetchVocab();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, timer, currentQuestion]);

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

  const generateQuestions = () => {
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    const generatedQuestions: Question[] = selected.map((word) => {
      // Get 3 random wrong answers
      const wrongAnswers = vocab
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.english_translation);

      // Combine and shuffle options
      const options = [word.english_translation, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        word,
        options,
        correctAnswer: word.english_translation,
      };
    });

    setQuestions(generatedQuestions);
  };

  const startGame = () => {
    generateQuestions();
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCorrectCount(0);
    setCurrentQuestion(0);
    setTimer(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.floor(timer * 2);
      setScore((prev) => prev + 100 + timeBonus);
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
        setTimer(30);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        endGame();
      }
    }, 1500);
  };

  const handleTimeout = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setTimer(30);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setGameOver(true);
    setGameStarted(false);

    // Save score
    try {
      await progressAPI.saveGameScore({
        game_type: 'speed_quiz',
        score,
        difficulty: 'medium',
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!gameStarted && !gameOver) {
    return (
      <div className="page-container game-intro">
        <h1>⚡ Speed Quiz</h1>
        <div className="game-intro-card">
          <p className="game-instructions">
            Answer as many vocabulary questions as you can!
          </p>
          <ul className="game-rules">
            <li>⏱️ 30 seconds per question</li>
            <li>🎯 10 questions total</li>
            <li>⭐ 100 points per correct answer</li>
            <li>🔥 Time bonus for quick answers!</li>
          </ul>
          <button onClick={startGame} className="btn-primary btn-large">
            Start Quiz
          </button>
          <button onClick={() => navigate('/games')} className="btn-secondary">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="page-container game-over">
        <div className="game-over-card">
          <h1>🎉 Quiz Complete!</h1>
          <div className="final-score">
            <div className="score-label">Final Score</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Correct:</span>
              <span className="stat-value">{correctCount} / {questions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Accuracy:</span>
              <span className="stat-value">{accuracy}%</span>
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

  const question = questions[currentQuestion];

  return (
    <div className="page-container quiz-active">
      <div className="game-header">
        <button onClick={() => navigate('/games')} className="btn-back">
          ← Back
        </button>
        <div className="game-stats-bar">
          <div className="stat-item">
            <span className="stat-icon">❓</span>
            <span className="stat-text">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">{timer}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-text">{score}</span>
          </div>
        </div>
      </div>

      <div className="quiz-container">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="question-card">
          <h2 className="question-label">Translate:</h2>
          <div className="spanish-word">{question.word.spanish_word}</div>
          {question.word.part_of_speech && (
            <div className="part-of-speech">({question.word.part_of_speech})</div>
          )}
        </div>

        <div className="options-grid">
          {question.options.map((option, index) => {
            let buttonClass = 'option-button';

            if (showFeedback) {
              if (option === question.correctAnswer) {
                buttonClass += ' correct';
              } else if (option === selectedAnswer) {
                buttonClass += ' incorrect';
              } else {
                buttonClass += ' disabled';
              }
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div
            className={`feedback ${
              selectedAnswer === question.correctAnswer ? 'correct' : 'incorrect'
            }`}
          >
            {selectedAnswer === question.correctAnswer ? (
              <span>✅ Correct!</span>
            ) : (
              <span>❌ Incorrect. The answer is: {question.correctAnswer}</span>
            )}
          </div>
        )}
      </div>

      <style>{`
        .quiz-active {
          max-width: 800px;
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

        .quiz-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
        }

        .question-card {
          text-align: center;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .question-label {
          color: #6b7280;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .spanish-word {
          font-size: 3rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .part-of-speech {
          color: #9ca3af;
          font-style: italic;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .option-button {
          padding: 1.5rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
          transform: scale(1.02);
        }

        .option-button.correct {
          background: #d1fae5;
          border-color: #10b981;
        }

        .option-button.incorrect {
          background: #fee2e2;
          border-color: #ef4444;
        }

        .option-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feedback {
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .feedback.correct {
          background: #d1fae5;
          color: #065f46;
        }

        .feedback.incorrect {
          background: #fee2e2;
          color: #991b1b;
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
