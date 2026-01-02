// ============================================
// GAMES PAGE - Educational Mini-games Hub
// Modern Card Design
// ============================================

import { Link } from 'react-router-dom';

export default function Games() {
  const games = [
    {
      id: 'word-match',
      name: 'Word Match',
      icon: '🎯',
      description: 'Empareja palabras en español con sus traducciones en inglés. ¡Encuentra todos los pares en 60 segundos!',
      difficulty: 'Fácil',
      points: '5-15 pts',
      colorClass: 'turquoise',
      time: '60 segundos',
    },
    {
      id: 'speed-quiz',
      name: 'Speed Quiz',
      icon: '⚡',
      description: 'Responde preguntas rápidas de vocabulario contra el reloj. ¡Cada segundo cuenta!',
      difficulty: 'Medio',
      points: '10-30 pts',
      colorClass: 'yellow',
      time: '5 minutos',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h1 className="page-title">🎮 Juegos Educativos</h1>
        <p className="page-subtitle">
          ¡Aprende español mientras te diviertes! Gana puntos, desbloquea badges y compite con tus compañeros
        </p>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className={`card card-interactive game-card-large fade-in`}
            style={{
              textDecoration: 'none',
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="game-card-header">
              <span className={`badge badge-${game.colorClass}`}>{game.difficulty}</span>
              <div className="game-icon-large">{game.icon}</div>
            </div>

            <h2 className="game-title">{game.name}</h2>
            <p className="game-description">{game.description}</p>

            <div className="game-meta-grid">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-label">{game.time}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">💰</span>
                <span className="meta-label">{game.points}</span>
              </div>
            </div>

            <button className={`btn btn-${game.colorClass} btn-large game-play-btn`}>
              <span>Jugar Ahora</span>
              <span>→</span>
            </button>
          </Link>
        ))}
      </div>

      {/* How to Play Section */}
      <div className="card how-to-play fade-in" style={{ animationDelay: '400ms', background: 'var(--color-bg-paper)', border: '2px solid var(--color-border)' }}>
        <h2 className="text-center" style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-text)', fontWeight: '700' }}>
          ¿Cómo Funciona?
        </h2>
        <div className="info-grid-horizontal">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Elige un Juego</h3>
              <p>Selecciona entre nuestra colección de juegos educativos</p>
            </div>
          </div>

          <div className="arrow-separator">→</div>

          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Gana Puntos</h3>
              <p>Obtén puntos según tu rendimiento y velocidad</p>
            </div>
          </div>

          <div className="arrow-separator">→</div>

          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Sube en el Ranking</h3>
              <p>Compite con tus compañeros en el leaderboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="card rewards-banner" style={{ background: 'var(--color-success-bg)', border: '2px solid var(--color-success)' }}>
        <div className="rewards-content">
          <div className="rewards-icon">🏆</div>
          <div className="rewards-text">
            <h3 style={{ fontWeight: '700', color: 'var(--color-text)' }}>Completa juegos para desbloquear badges exclusivos</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Cada juego te acerca más a tu próximo badge y aumenta tu racha diaria</p>
          </div>
          <Link to="/progress" className="btn btn-primary">
            Ver Mi Progreso
          </Link>
        </div>
      </div>

      <style>{`
        /* Games Grid */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--spacing-2xl);
          margin-bottom: var(--spacing-3xl);
        }

        /* Game Card Large */
        .game-card-large {
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }

        .game-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-lg);
        }

        .game-icon-large {
          font-size: 5rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: transform var(--transition-bounce);
        }

        .game-card-large:hover .game-icon-large {
          transform: scale(1.2) rotate(10deg);
        }

        .game-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text);
          margin-bottom: var(--spacing-md);
        }

        .game-description {
          color: var(--color-text-light);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: var(--spacing-xl);
          flex: 1;
        }

        .game-meta-grid {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-md);
          background: var(--color-bg);
          border-radius: var(--radius-lg);
        }

        .meta-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: 600;
          color: var(--color-text);
        }

        .meta-icon {
          font-size: 1.25rem;
        }

        .game-play-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* How to Play Section */
        .how-to-play {
          margin-top: var(--spacing-3xl);
        }

        .info-grid-horizontal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .info-step {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--spacing-md);
        }

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 800;
          box-shadow: var(--shadow-lg);
        }

        .step-content h3 {
          font-size: 1.25rem;
          color: var(--color-text);
          margin-bottom: var(--spacing-xs);
        }

        .step-content p {
          color: var(--color-text-light);
          font-size: 0.95rem;
        }

        .arrow-separator {
          font-size: 2rem;
          color: var(--color-coral);
          font-weight: 800;
        }

        /* Rewards Banner */
        .rewards-banner {
          margin-top: var(--spacing-3xl);
          border-radius: var(--radius-lg);
          padding: var(--spacing-2xl);
        }

        .rewards-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-2xl);
          flex-wrap: wrap;
        }

        .rewards-icon {
          font-size: 5rem;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        }

        .rewards-text {
          flex: 1;
          min-width: 250px;
        }

        .rewards-text h3 {
          font-size: 1.5rem;
          color: var(--color-text);
          margin-bottom: var(--spacing-sm);
          font-weight: 700;
        }

        .rewards-text p {
          color: var(--color-text-light);
          font-size: 1rem;
        }

        /* Button Color Variants */
        .btn-turquoise {
          background: var(--color-primary);
          color: white;
        }

        .btn-turquoise:hover {
          background: var(--color-primary-dark);
          box-shadow: var(--shadow-lg);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .games-grid {
            grid-template-columns: 1fr;
          }

          .info-grid-horizontal {
            flex-direction: column;
          }

          .arrow-separator {
            transform: rotate(90deg);
          }

          .rewards-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
