// ============================================
// CREATE ASSIGNMENT PAGE - Teacher only
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentAPI } from '../services/api';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'vocabulary' as 'vocabulary' | 'quiz' | 'writing' | 'listening' | 'game',
    difficulty: 'beginner',
    points: 10,
    max_attempts: 3,
    time_limit_minutes: undefined as number | undefined,
    due_date: '',
    assigned_to: 'all',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await assignmentAPI.create({
        ...formData,
        time_limit_minutes: formData.time_limit_minutes || undefined,
        due_date: formData.due_date || undefined,
      });

      alert('Assignment created successfully!');
      navigate('/assignments');
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Assignment</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Practice Numbers 1-100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what students need to do..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="quiz">Quiz</option>
              <option value="writing">Writing</option>
              <option value="listening">Listening</option>
              <option value="game">Game</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="max_attempts">Max Attempts</label>
            <input
              type="number"
              id="max_attempts"
              min="1"
              max="10"
              value={formData.max_attempts}
              onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time_limit">Time Limit (minutes)</label>
            <input
              type="number"
              id="time_limit"
              min="1"
              placeholder="No limit"
              value={formData.time_limit_minutes || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_minutes: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="datetime-local"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Assign To</label>
            <select
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            >
              <option value="all">All Students</option>
              <option value="group:A">Group A</option>
              <option value="group:B">Group B</option>
              <option value="group:C">Group C</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/assignments')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>

      <style>{`
        .assignment-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 800px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .form-actions button {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
