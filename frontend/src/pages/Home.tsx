// ============================================
// HOME PAGE - Colorful & Fun Design
// ============================================

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'var(--color-primary)',
          fontWeight: '800',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          ¡Aprende Español con Silvana! 🌟
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--color-secondary)',
          marginBottom: '1.5rem',
          fontWeight: '600'
        }}>
          Spanish with Silvana
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.8',
          marginBottom: '2.5rem'
        }}>
          Domina el vocabulario español con ejemplos contextuales, flashcards inteligentes,
          juegos interactivos y seguimiento de progreso personalizado
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/vocabulary" className="btn btn-primary btn-large">
            📚 Explorar Vocabulario
          </Link>
          {user ? (
            user.role === 'student' ? (
              <>
                <Link to="/games" className="btn btn-secondary btn-large">
                  🎮 Jugar Ahora
                </Link>
                <Link to="/flashcards" className="btn btn-purple btn-large">
                  🎯 Practicar
                </Link>
              </>
            ) : (
              <>
                <Link to="/manage" className="btn btn-secondary btn-large">
                  ✏️ Gestionar Vocabulario
                </Link>
                <Link to="/analytics" className="btn btn-purple btn-large">
                  📊 Ver Analytics
                </Link>
              </>
            )
          ) : (
            <Link to="/login" className="btn btn-secondary btn-large">
              🚀 Comenzar Ahora
            </Link>
          )}
        </div>
      </div>

      {/* Features Grid - Colorful Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginTop: '4rem',
        marginBottom: '4rem'
      }}>
        {/* Card 1 - Coral */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-primary)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '1rem'
          }}>
            Aprendizaje Contextual
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Aprende palabras con ejemplos del mundo real y contexto de uso auténtico. Cada término incluye definiciones claras y contexto cultural.
          </p>
          <Link to="/vocabulary" className="btn btn-primary">
            Explorar →
          </Link>
        </div>

        {/* Card 2 - Turquoise */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-secondary)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎴</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-secondary)',
            marginBottom: '1rem'
          }}>
            Flashcards Inteligentes
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Practica con flashcards interactivas que se adaptan a tu nivel. Sistema de repetición espaciada inteligente.
          </p>
          <Link to="/flashcards" className="btn btn-secondary">
            Practicar →
          </Link>
        </div>

        {/* Card 3 - Purple */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-purple)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-purple)',
            marginBottom: '1rem'
          }}>
            Juegos Educativos
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Word Match, Speed Quiz, Memory Cards y más. ¡Aprende jugando y gana puntos para desbloquear badges!
          </p>
          <Link to="/games" className="btn btn-purple">
            Jugar →
          </Link>
        </div>

        {/* Card 4 - Pink */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-pink)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-pink)',
            marginBottom: '1rem'
          }}>
            Seguimiento de Progreso
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Visualiza tu progreso con gráficos detallados. Gana puntos, desbloquea badges y sube en el ranking.
          </p>
          <Link to="/progress" className="btn btn-pink">
            Ver Progreso →
          </Link>
        </div>

        {/* Card 5 - Coral (secondary) */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-warning)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-warning)',
            marginBottom: '1rem'
          }}>
            Tareas Asignadas
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Completa tareas con fechas límite y recibe feedback personalizado de tu profesora.
          </p>
          <Link to="/assignments" className="btn" style={{ background: 'var(--color-warning)', color: 'white' }}>
            Ver Tareas →
          </Link>
        </div>

        {/* Card 6 - Success Green */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '3px solid var(--color-success)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👩‍🏫</div>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-success)',
            marginBottom: '1rem'
          }}>
            Panel de Profesores
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Herramientas para crear vocabulario, asignar tareas y analizar el progreso de la clase.
          </p>
          <Link to="/analytics" className="btn btn-success">
            Ver Analytics →
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div style={{
          background: 'var(--color-primary-bg)',
          borderRadius: '32px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '3px solid var(--color-primary)',
          marginTop: '4rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'var(--color-text)',
            marginBottom: '1rem'
          }}>
            🎯 ¿Listo para mejorar tu español?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            Únete a Spanish with Silvana y comienza tu viaje de aprendizaje hoy.
            <br />
            Aprende vocabulario de forma divertida y efectiva.
          </p>
          <Link to="/login" className="btn btn-primary btn-large">
            Iniciar Sesión →
          </Link>
        </div>
      )}
    </div>
  );
}
