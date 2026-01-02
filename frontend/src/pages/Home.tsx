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
          color: 'var(--color-primary)',
          fontWeight: '800',
          marginBottom: '1rem'
        }}>
          ¡Aprende Español con Silvana! 🌟
        </h1>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '1rem', fontWeight: '600' }}>
          Spanish with Silvana
        </h2>
        <p className="subtitle" style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
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
        <Link to="/vocabulary" className="card card-interactive fade-in" style={{ textDecoration: 'none' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Aprendizaje Contextual
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Aprende palabras con ejemplos del mundo real y contexto de uso auténtico. Cada término incluye definiciones claras, ejemplos de uso y contexto cultural.
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Explorar Vocabulario <span>→</span>
          </span>
        </Link>

        <Link to="/flashcards" className="card card-interactive fade-in" style={{ textDecoration: 'none', animationDelay: '100ms' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎴</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Flashcards Inteligentes
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Practica con flashcards interactivas que se adaptan a tu nivel. Sistema de repetición espaciada que prioriza las palabras que necesitas repasar.
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Practicar Ahora <span>→</span>
          </span>
        </Link>

        <Link to="/games" className="card card-interactive fade-in" style={{ textDecoration: 'none', animationDelay: '200ms' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Juegos Educativos
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Word Match, Speed Quiz, Memory Cards y más. Aprende jugando y gana puntos para desbloquear badges exclusivos. ¡Compite con tus compañeros!
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Jugar Ahora <span>→</span>
          </span>
        </Link>

        <Link to="/progress" className="card card-interactive fade-in" style={{ textDecoration: 'none', animationDelay: '300ms' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Seguimiento de Progreso
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Visualiza tu progreso con gráficos detallados. Gana puntos, desbloquea badges, mantén rachas diarias y sube en el ranking de tu clase.
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Ver Mi Progreso <span>→</span>
          </span>
        </Link>

        <Link to="/assignments" className="card card-interactive fade-in" style={{ textDecoration: 'none', animationDelay: '400ms' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Tareas Asignadas
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Completa tareas con fechas límite, recibe feedback personalizado de tu profesora y mejora continuamente. Cada tarea suma a tu progreso total.
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Ver Tareas <span>→</span>
          </span>
        </Link>

        <Link to="/analytics" className="card card-interactive fade-in" style={{ textDecoration: 'none', animationDelay: '500ms' }}>
          <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩‍🏫</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Dashboard para Profesores
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Herramientas profesionales para crear vocabulario personalizado, asignar tareas, gestionar estudiantes y analizar el progreso de la clase.
          </p>
          <span className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Ver Analytics <span>→</span>
          </span>
        </Link>
      </div>

      <div className="card" style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '3rem',
        background: 'var(--color-primary-bg)',
        border: '2px solid var(--color-primary-light)'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: '700' }}>
          🎯 ¿Listo para mejorar tu español?
        </h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Únete a Spanish with Silvana y comienza tu viaje de aprendizaje hoy. Aprende vocabulario de forma divertida y efectiva.
        </p>
        {!user && (
          <Link to="/login" className="btn btn-primary btn-large">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}
