// ============================================
// HOME PAGE - Landing page
// ============================================

import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container">
      <div className="home-hero">
        <h1>Learn Spanish Vocabulary</h1>
        <p className="subtitle">
          Master Spanish words with contextual examples and smart flashcards
        </p>

        <div className="home-actions">
          <Link to="/vocabulary" className="btn-primary btn-large">
            Browse Vocabulary
          </Link>
          <Link to="/flashcards" className="btn-secondary btn-large">
            Start Practicing
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Contextual Learning</h3>
          <p>Learn words with real-world examples and usage context</p>
        </div>

        <div className="feature-card">
          <h3>Smart Flashcards</h3>
          <p>Practice with interactive flashcards and track your progress</p>
        </div>

        <div className="feature-card">
          <h3>Progress Tracking</h3>
          <p>Monitor your learning journey and identify areas to improve</p>
        </div>

        <div className="feature-card">
          <h3>Teacher Dashboard</h3>
          <p>Teachers can create vocabulary and view student analytics</p>
        </div>
      </div>
    </div>
  );
}
