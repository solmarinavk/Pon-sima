// ============================================
// ASSIGNMENTS PAGE - List assignments (Teacher & Student)
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI, Assignment } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentAPI.getAll();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await assignmentAPI.delete(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return 'No deadline';
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue (${Math.abs(diffDays)} days ago)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{user?.role === 'teacher' ? 'Manage Assignments' : 'My Assignments'}</h1>
        {user?.role === 'teacher' && (
          <Link to="/assignments/create" className="btn-primary">
            Create New Assignment
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>
            {user?.role === 'teacher'
              ? 'No assignments created yet. Create your first assignment!'
              : 'No assignments available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`assignment-card ${isOverdue(assignment.due_date) ? 'overdue' : ''}`}
            >
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                <span className={`assignment-type ${assignment.type}`}>
                  {assignment.type}
                </span>
              </div>

              {assignment.description && (
                <p className="assignment-description">{assignment.description}</p>
              )}

              <div className="assignment-meta">
                <div className="meta-item">
                  <strong>Difficulty:</strong> {assignment.difficulty || 'N/A'}
                </div>
                <div className="meta-item">
                  <strong>Points:</strong> {assignment.points}
                </div>
                <div className="meta-item">
                  <strong>Max Attempts:</strong> {assignment.max_attempts}
                </div>
                {assignment.time_limit_minutes && (
                  <div className="meta-item">
                    <strong>Time Limit:</strong> {assignment.time_limit_minutes} min
                  </div>
                )}
              </div>

              <div className={`assignment-due ${isOverdue(assignment.due_date) ? 'overdue' : ''}`}>
                <strong>Due:</strong> {formatDueDate(assignment.due_date)}
              </div>

              <div className="assignment-actions">
                <Link to={`/assignments/${assignment.id}`} className="btn-secondary">
                  {user?.role === 'teacher' ? 'View Submissions' : 'View & Submit'}
                </Link>

                {user?.role === 'teacher' && (
                  <>
                    <Link to={`/assignments/${assignment.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .assignment-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .assignment-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .assignment-card.overdue {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .assignment-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .assignment-type {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .assignment-type.vocabulary { background: #dbeafe; color: #1e40af; }
        .assignment-type.quiz { background: #fef3c7; color: #92400e; }
        .assignment-type.writing { background: #f3e8ff; color: #6b21a8; }
        .assignment-type.listening { background: #d1fae5; color: #065f46; }
        .assignment-type.game { background: #fce7f3; color: #9f1239; }

        .assignment-description {
          color: #6b7280;
          margin: 0.5rem 0 1rem;
          font-size: 0.875rem;
        }

        .assignment-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin: 1rem 0;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .meta-item {
          font-size: 0.875rem;
        }

        .meta-item strong {
          color: #374151;
        }

        .assignment-due {
          margin: 1rem 0;
          padding: 0.75rem;
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .assignment-due.overdue {
          background: #fee2e2;
          border-left-color: #ef4444;
          color: #991b1b;
        }

        .assignment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .assignment-actions .btn-secondary,
        .assignment-actions .btn-danger {
          flex: 1;
          text-align: center;
          font-size: 0.875rem;
          padding: 0.5rem;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
