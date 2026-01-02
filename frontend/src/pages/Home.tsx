// ============================================
// HOME PAGE - Spanish with Silvana Landing Page
// ============================================

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="home-hero">
        <h1 style={{
          fontSize: '3.5rem',
          background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          ¡Aprende Español con Silvana! 🌟
        </h1>
        <h2 style={{ fontSize: '2rem', color: '#374151', marginBottom: '1rem' }}>
          Spanish with Silvana
        </h2>
        <p className="subtitle" style={{ fontSize: '1.25rem', color: '#6B7280' }}>
          Domina el vocabulario español con ejemplos contextuales, flashcards inteligentes,
          juegos interactivos y seguimiento de progreso personalizado
        </p>

        <div className="home-actions" style={{ marginTop: '2rem' }}>
          <Link to="/vocabulary" className="btn-primary btn-large">
            📚 Explorar Vocabulario
          </Link>
          {user ? (
            user.role === 'student' ? (
              <>
                <Link to="/games" className="btn-secondary btn-large">
                  🎮 Jugar Ahora
                </Link>
                <Link to="/flashcards" className="btn-secondary btn-large">
                  🎯 Practicar
                </Link>
              </>
            ) : (
              <>
                <Link to="/manage" className="btn-secondary btn-large">
                  ✏️ Gestionar Vocabulario
                </Link>
                <Link to="/analytics" className="btn-secondary btn-large">
                  📊 Ver Analytics
                </Link>
              </>
            )
          ) : (
            <Link to="/login" className="btn-secondary btn-large">
              🚀 Comenzar Ahora
            </Link>
          )}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card-modern coral fade-in">
          <div className="icon">📖</div>
          <h3>Aprendizaje Contextual</h3>
          <p>Aprende palabras con ejemplos del mundo real y contexto de uso auténtico</p>
        </div>

        <div className="feature-card-modern turquoise fade-in" style={{ animationDelay: '100ms' }}>
          <div className="icon">🎴</div>
          <h3>Flashcards Inteligentes</h3>
          <p>Practica con flashcards interactivas y sigue tu progreso en tiempo real</p>
        </div>

        <div className="feature-card-modern yellow fade-in" style={{ animationDelay: '200ms' }}>
          <div className="icon">🎮</div>
          <h3>Juegos Educativos</h3>
          <p>Word Match, Speed Quiz y más juegos divertidos para reforzar tu aprendizaje</p>
        </div>

        <div className="feature-card-modern purple fade-in" style={{ animationDelay: '300ms' }}>
          <div className="icon">📊</div>
          <h3>Seguimiento de Progreso</h3>
          <p>Gana puntos, badges y mantén rachas. Compite en el leaderboard con tus compañeros</p>
        </div>

        <div className="feature-card-modern pink fade-in" style={{ animationDelay: '400ms' }}>
          <div className="icon">📝</div>
          <h3>Tareas Asignadas</h3>
          <p>Completa tareas con fechas límite y recibe feedback de tu profesora</p>
        </div>

        <div className="feature-card-modern blue fade-in" style={{ animationDelay: '500ms' }}>
          <div className="icon">👩‍🏫</div>
          <h3>Dashboard para Profesores</h3>
          <p>Silvana puede crear vocabulario, asignar tareas y ver analytics detallados</p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '3rem',
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1))',
        borderRadius: '16px'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1F2937' }}>
          🎯 ¿Listo para mejorar tu español?
        </h2>
        <p style={{ fontSize: '1.25rem', color: '#6B7280', marginBottom: '2rem' }}>
          Únete a Spanish with Silvana y comienza tu viaje de aprendizaje hoy
        </p>
        {!user && (
          <Link to="/login" className="btn-primary btn-large">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}
