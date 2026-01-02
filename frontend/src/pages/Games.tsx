// ============================================
// GAMES PAGE - Educational Mini-games Hub
// ============================================

import { Link } from 'react-router-dom';

export default function Games() {
  const games = [
    {
      id: 'word-match',
      name: 'Word Match',
      icon: '🎯',
      description: 'Match Spanish words with their English translations',
      difficulty: 'Easy',
      points: '5-15 pts',
      color: '#3b82f6',
    },
    {
      id: 'speed-quiz',
      name: 'Speed Quiz',
      icon: '⚡',
      description: 'Quick-fire vocabulary questions against the clock',
      difficulty: 'Medium',
      points: '10-30 pts',
      color: '#f59e0b',
    },
    {
      id: 'memory-cards',
      name: 'Memory Cards',
      icon: '🧠',
      description: 'Flip cards to find matching pairs',
      difficulty: 'Easy',
      points: '5-20 pts',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎮 Educational Games</h1>
        <p className="subtitle">Learn Spanish while having fun!</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className="game-card"
            style={{ borderTopColor: game.color }}
          >
            <div className="game-icon">{game.icon}</div>
            <h2>{game.name}</h2>
            <p className="game-description">{game.description}</p>
            <div className="game-meta">
              <span className="difficulty" style={{ color: game.color }}>
                {game.difficulty}
              </span>
              <span className="points">💰 {game.points}</span>
            </div>
            <button className="play-button" style={{ backgroundColor: game.color }}>
              Play Now
            </button>
          </Link>
        ))}
      </div>

      <div className="games-info">
        <h2>How to Play</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Choose a Game</h3>
            <p>Select from our collection of educational games</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🏆</div>
            <h3>Earn Points</h3>
            <p>Score points based on your performance</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>Track Progress</h3>
            <p>See your scores on the leaderboard</p>
          </div>
        </div>
      </div>

      <style>{`
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .game-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-decoration: none;
          color: inherit;
          border-top: 6px solid;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .game-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .game-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .game-card h2 {
          margin-bottom: 1rem;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .game-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .game-meta {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .difficulty {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .points {
          font-weight: 600;
          font-size: 0.875rem;
          color: #fbbf24;
        }

        .play-button {
          width: 100%;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .games-info {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-top: 3rem;
        }

        .games-info h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #1f2937;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .info-card {
          text-align: center;
          padding: 1.5rem;
        }

        .info-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .info-card h3 {
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .info-card p {
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
