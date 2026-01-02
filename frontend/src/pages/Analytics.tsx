// ============================================
// ANALYTICS PAGE - Teacher dashboard
// ============================================

import { useState, useEffect } from 'react';
import { adminAPI, assignmentAPI, progressAPI, User, Assignment, LeaderboardEntry } from '../services/api';

export default function Analytics() {
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, assignmentsData, leaderboardData] = await Promise.all([
        adminAPI.getAllUsers({ role: 'student' }),
        assignmentAPI.getAll(),
        progressAPI.getPointsLeaderboard(20),
      ]);

      setStudents(studentsData);
      setAssignments(assignmentsData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.is_active).length;
  const totalAssignments = assignments.length;
  const avgPoints = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.total_points, 0) / students.length)
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p className="subtitle">Monitor student progress and performance</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{activeStudents}</div>
          <div className="stat-label">Active Students</div>
          <div className="stat-detail">{totalStudents} total</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{totalAssignments}</div>
          <div className="stat-label">Total Assignments</div>
          <div className="stat-detail">Created</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{avgPoints}</div>
          <div className="stat-label">Avg Points</div>
          <div className="stat-detail">Per student</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">
            {students.filter((s) => s.current_streak > 0).length}
          </div>
          <div className="stat-label">Active Streaks</div>
          <div className="stat-detail">Students with streaks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students ({students.length})
        </button>
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-section">
            <h2>🏆 Top Performers</h2>
            <div className="leaderboard-table">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div key={entry.user_id} className="leaderboard-row">
                  <div className="rank-badge">{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">{entry.name}</div>
                    <div className="player-username">@{entry.username}</div>
                  </div>
                  <div className="player-stats">
                    <span className="stat-points">⭐ {entry.total_points}</span>
                    <span className="stat-streak">🔥 {entry.current_streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overview-section">
            <h2>📈 Performance Distribution</h2>
            <div className="distribution-grid">
              <div className="dist-card beginner">
                <div className="dist-icon">🌱</div>
                <div className="dist-value">
                  {students.filter((s) => s.level === 'beginner').length}
                </div>
                <div className="dist-label">Beginner</div>
              </div>
              <div className="dist-card intermediate">
                <div className="dist-icon">📚</div>
                <div className="dist-value">
                  {students.filter((s) => s.level === 'intermediate').length}
                </div>
                <div className="dist-label">Intermediate</div>
              </div>
              <div className="dist-card advanced">
                <div className="dist-icon">🚀</div>
                <div className="dist-value">
                  {students.filter((s) => s.level === 'advanced').length}
                </div>
                <div className="dist-label">Advanced</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="tab-content">
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Level</th>
                  <th>Group</th>
                  <th>Points</th>
                  <th>Streak</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="student-name">{student.name}</td>
                    <td className="student-username">@{student.username}</td>
                    <td>
                      <span className={`level-badge ${student.level}`}>
                        {student.level || 'beginner'}
                      </span>
                    </td>
                    <td>{student.student_group || '-'}</td>
                    <td className="points">⭐ {student.total_points}</td>
                    <td className="streak">
                      {student.current_streak > 0 ? `🔥 ${student.current_streak}` : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="date">{new Date(student.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="tab-content">
          <div className="assignments-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Points</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="assignment-title">{assignment.title}</td>
                    <td>
                      <span className={`type-badge ${assignment.type}`}>
                        {assignment.type}
                      </span>
                    </td>
                    <td>
                      <span className={`difficulty-badge ${assignment.difficulty}`}>
                        {assignment.difficulty}
                      </span>
                    </td>
                    <td className="points">💰 {assignment.points}</td>
                    <td className="date">
                      {assignment.due_date
                        ? new Date(assignment.due_date).toLocaleDateString()
                        : 'No deadline'}
                    </td>
                    <td>{assignment.assigned_to}</td>
                    <td className="date">{new Date(assignment.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-top: 4px solid #3b82f6;
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
        }

        .stat-label {
          color: #6b7280;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-detail {
          color: #9ca3af;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab {
          padding: 1rem 2rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.2s;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab:hover {
          color: #3b82f6;
        }

        .tab-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
        }

        .overview-section {
          margin-bottom: 3rem;
        }

        .overview-section h2 {
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .leaderboard-table {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .leaderboard-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .rank-badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }

        .player-info {
          flex: 1;
        }

        .player-name {
          font-weight: 600;
          color: #1f2937;
        }

        .player-username {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .player-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-points {
          color: #fbbf24;
          font-weight: 600;
        }

        .stat-streak {
          color: #f97316;
          font-weight: 600;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .dist-card {
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .dist-card.beginner {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .dist-card.intermediate {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .dist-card.advanced {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        }

        .dist-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .dist-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
        }

        .dist-label {
          color: #4b5563;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .students-table, .assignments-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .student-name {
          font-weight: 600;
          color: #1f2937;
        }

        .student-username {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .level-badge, .type-badge, .difficulty-badge, .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .level-badge.beginner {
          background: #dbeafe;
          color: #1e40af;
        }

        .level-badge.intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .level-badge.advanced {
          background: #d1fae5;
          color: #065f46;
        }

        .type-badge.vocabulary {
          background: #dbeafe;
          color: #1e40af;
        }

        .type-badge.quiz {
          background: #fef3c7;
          color: #92400e;
        }

        .type-badge.writing {
          background: #f3e8ff;
          color: #6b21a8;
        }

        .type-badge.listening {
          background: #d1fae5;
          color: #065f46;
        }

        .type-badge.game {
          background: #fce7f3;
          color: #9f1239;
        }

        .difficulty-badge.beginner {
          background: #d1fae5;
          color: #065f46;
        }

        .difficulty-badge.intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .difficulty-badge.advanced {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .points {
          font-weight: 600;
        }

        .streak {
          font-weight: 600;
        }

        .date {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .assignment-title {
          font-weight: 600;
          color: #1f2937;
        }
      `}</style>
    </div>
  );
}
