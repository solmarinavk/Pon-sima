// ============================================
// APP - Main application component with routing
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VocabularyList from './pages/VocabularyList';
import FlashcardsPage from './pages/FlashcardsPage';
import ManageVocab from './pages/ManageVocab';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import Progress from './pages/Progress';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <Navbar
        userRole={user?.role}
        userName={user?.name}
        onLogout={logout}
      />

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (requires auth) */}
          <Route
            path="/vocabulary"
            element={
              <ProtectedRoute>
                <VocabularyList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />

          {/* Assignment routes (both roles) */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />

          {/* Progress route (students only) */}
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />

          {/* Teacher-only routes */}
          <Route
            path="/manage"
            element={
              <ProtectedRoute requireRole="teacher">
                <ManageVocab />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments/create"
            element={
              <ProtectedRoute requireRole="teacher">
                <CreateAssignment />
              </ProtectedRoute>
            }
          />

          {/* Phase 5C: Progress tracking & gamification */}
          {/* <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} /> */}
          {/* <Route path="/analytics" element={<ProtectedRoute requireRole="teacher"><Analytics /></ProtectedRoute>} /> */}

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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
