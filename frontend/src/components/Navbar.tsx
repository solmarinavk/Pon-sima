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
            Vocabulary
          </Link>

          {userRole && (
            <Link to="/assignments" className="nav-link">
              {userRole === 'teacher' ? 'Assignments' : 'My Tasks'}
            </Link>
          )}

          {userRole === 'student' && (
            <>
              <Link to="/flashcards" className="nav-link">
                Flashcards
              </Link>
              <Link to="/games" className="nav-link">
                Games
              </Link>
              <Link to="/progress" className="nav-link">
                My Progress
              </Link>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              <Link to="/manage" className="nav-link">
                Manage Vocab
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
                {userName} ({userRole})
              </span>
              {onLogout && (
                <button onClick={onLogout} className="btn-logout">
                  Logout
                </button>
              )}
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
