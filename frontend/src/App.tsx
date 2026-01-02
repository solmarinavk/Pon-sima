// ============================================
// APP - Main application component with routing
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import VocabularyList from './pages/VocabularyList';
import FlashcardsPage from './pages/FlashcardsPage';
import ManageVocab from './pages/ManageVocab';
import './App.css';

function App() {
  // TODO: In Phase 4, implement actual auth state management
  // For now, using mock data
  const mockUser = {
    name: 'Demo User',
    role: 'teacher' as const, // Change to 'student' to test student view
  };

  const handleLogout = () => {
    console.log('Logout clicked - will be implemented in Phase 4');
    // TODO: Implement in Phase 4
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar
          userRole={mockUser.role}
          userName={mockUser.name}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vocabulary" element={<VocabularyList />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/manage" element={<ManageVocab />} />

            {/* Phase 4: Login/Register pages */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/register" element={<Register />} /> */}

            {/* Phase 5: Progress tracking */}
            {/* <Route path="/progress" element={<Progress />} /> */}
            {/* <Route path="/analytics" element={<Analytics />} /> */}

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="page-container">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>Vocab Platform - Built with Cloudflare Stack</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
