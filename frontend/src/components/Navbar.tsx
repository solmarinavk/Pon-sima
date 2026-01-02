// ============================================
// NAVBAR - Main navigation
// ============================================

import { Link } from 'react-router-dom';

interface NavbarProps {
  userRole?: 'student' | 'teacher';
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({ userRole, userName, onLogout }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🌟 Spanish with Silvana
        </Link>

        <div className="navbar-links">
          <Link to="/vocabulary" className="nav-link">
            Vocabulario
          </Link>

          {userRole && (
            <Link to="/assignments" className="nav-link">
              {userRole === 'teacher' ? 'Tareas' : 'Mis Tareas'}
            </Link>
          )}

          {userRole === 'student' && (
            <>
              <Link to="/flashcards" className="nav-link">
                Flashcards
              </Link>
              <Link to="/games" className="nav-link">
                Juegos
              </Link>
              <Link to="/progress" className="nav-link">
                Mi Progreso
              </Link>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              <Link to="/manage" className="nav-link">
                Gestionar Vocab
              </Link>
              <Link to="/manage-users" className="nav-link">
                Gestionar Usuarios
              </Link>
              <Link to="/analytics" className="nav-link">
                Analytics
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {userName ? (
            <>
              <span className="user-name">
                {userName} ({userRole === 'teacher' ? 'Profesora' : 'Estudiante'})
              </span>
              {onLogout && (
                <button onClick={onLogout} className="btn-logout">
                  Salir
                </button>
              )}
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
