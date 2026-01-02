// ============================================
// PROGRESS PAGE - Gamification & Stats
// ============================================

import { useState, useEffect } from 'react';
import { progressAPI, Badge, LeaderboardEntry, ProgressSummary } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Progress() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streaksLeaderboard, setStreaksLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'leaderboard'>('stats');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, badgesData, pointsData, streaksData] = await Promise.all([
        progressAPI.getSummary(),
        progressAPI.getMyBadges(),
        progressAPI.getPointsLeaderboard(10),
        progressAPI.getStreaksLeaderboard(10),
      ]);

      setSummary(summaryData);
      setBadges(badgesData);
      setPointsLeaderboard(pointsData);
      setStreaksLeaderboard(streaksData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeInfo = (badgeType: string) => {
    const badges: Record<string, { name: string; icon: string; description: string }> = {
      first_word: { name: 'First Word', icon: '🎯', description: 'Learned your first word!' },
      vocab_10: { name: 'Vocab Learner', icon: '📚', description: 'Learned 10 words' },
      vocab_50: { name: 'Word Master', icon: '🌟', description: 'Learned 50 words' },
      vocab_100: { name: 'Vocabulary Champion', icon: '🏆', description: 'Learned 100 words' },
      accurate: { name: 'Accuracy Expert', icon: '🎯', description: '80% accuracy with 20+ reviews' },
      dedicated: { name: 'Dedicated Learner', icon: '💪', description: 'Completed 10 reviews' },
      streak_7: { name: 'Week Warrior', icon: '🔥', description: '7-day streak!' },
      streak_30: { name: 'Month Champion', icon: '⭐', description: '30-day streak!' },
    };

    return badges[badgeType] || { name: badgeType, icon: '🏅', description: 'Achievement unlocked!' };
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Progress</h1>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card points">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{user?.total_points || 0}</div>
          <div className="stat-label">Total Points</div>
        </div>

        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{user?.current_streak || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>

        <div className="stat-card level">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{user?.level || 'Beginner'}</div>
          <div className="stat-label">Level</div>
        </div>

        <div className="stat-card badges">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{badges.length}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges ({badges.length})
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && summary && (
        <div className="tab-content">
          <div className="progress-section">
            <h2>Vocabulary Progress</h2>
            <div className="progress-bars">
              <div className="progress-item">
                <div className="progress-header">
                  <span>Learned Words</span>
                  <span className="progress-value">{summary.learned} / {summary.total_words}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill learned"
                    style={{ width: `${(summary.learned / summary.total_words) * 100}%` }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <span>Learning</span>
                  <span className="progress-value">{summary.learning}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill learning"
                    style={{ width: `${(summary.learning / summary.total_words) * 100}%` }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <span>Difficult</span>
                  <span className="progress-value">{summary.difficult}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill difficult"
                    style={{ width: `${(summary.difficult / summary.total_words) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stats-details">
            <div className="stat-detail-card">
              <h3>Review Stats</h3>
              <div className="detail-row">
                <span>Total Reviews:</span>
                <strong>{summary.total_reviews}</strong>
              </div>
              <div className="detail-row">
                <span>Correct:</span>
                <strong className="text-success">{summary.total_correct}</strong>
              </div>
              <div className="detail-row">
                <span>Incorrect:</span>
                <strong className="text-danger">{summary.total_incorrect}</strong>
              </div>
              <div className="detail-row">
                <span>Accuracy:</span>
                <strong>
                  {summary.total_reviews > 0
                    ? Math.round((summary.total_correct / summary.total_reviews) * 100)
                    : 0}
                  %
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="tab-content">
          <div className="badges-grid">
            {badges.length === 0 ? (
              <div className="empty-state">
                <p>No badges yet. Keep learning to earn your first badge!</p>
              </div>
            ) : (
              badges.map((badge) => {
                const badgeInfo = getBadgeInfo(badge.badge_type);
                return (
                  <div key={badge.id} className="badge-card">
                    <div className="badge-icon">{badgeInfo.icon}</div>
                    <h3>{badgeInfo.name}</h3>
                    <p>{badgeInfo.description}</p>
                    <div className="badge-date">
                      Earned: {new Date(badge.awarded_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="tab-content">
          <div className="leaderboard-section">
            <h2>🏆 Top Students by Points</h2>
            <div className="leaderboard-table">
              {pointsLeaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`leaderboard-row ${entry.user_id === user?.id ? 'highlight' : ''}`}
                >
                  <div className="rank">#{entry.rank}</div>
                  <div className="player-info">
                    <div className="player-name">{entry.name}</div>
                    <div className="player-username">@{entry.username}</div>
                  </div>
                  <div className="player-stats">
                    <span className="points">⭐ {entry.total_points}</span>
                    <span className="streak">🔥 {entry.current_streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-section">
            <h2>🔥 Top Students by Streak</h2>
            <div className="leaderboard-table">
              {streaksLeaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`leaderboard-row ${entry.user_id === user?.id ? 'highlight' : ''}`}
                >
                  <div className="rank">#{entry.rank}</div>
                  <div className="player-info">
                    <div className="player-name">{entry.name}</div>
                    <div className="player-username">@{entry.username}</div>
                  </div>
                  <div className="player-stats">
                    <span className="streak">🔥 {entry.current_streak} days</span>
                    <span className="points">⭐ {entry.total_points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-card.points { border-top: 4px solid #fbbf24; }
        .stat-card.streak { border-top: 4px solid #f97316; }
        .stat-card.level { border-top: 4px solid #3b82f6; }
        .stat-card.badges { border-top: 4px solid #8b5cf6; }

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

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-section h2 {
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #374151;
        }

        .progress-bar {
          height: 24px;
          background: #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-fill.learned { background: #10b981; }
        .progress-fill.learning { background: #3b82f6; }
        .progress-fill.difficult { background: #f59e0b; }

        .stats-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .stat-detail-card {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .stat-detail-card h3 {
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .text-success { color: #10b981; }
        .text-danger { color: #ef4444; }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .badge-card {
          background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .badge-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .badge-card h3 {
          margin-bottom: 0.5rem;
          color: #92400e;
        }

        .badge-card p {
          color: #78350f;
          font-size: 0.875rem;
        }

        .badge-date {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #92400e;
          opacity: 0.7;
        }

        .leaderboard-section {
          margin-bottom: 3rem;
        }

        .leaderboard-section h2 {
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
          transition: all 0.2s;
        }

        .leaderboard-row:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .leaderboard-row.highlight {
          background: #dbeafe;
          border: 2px solid #3b82f6;
        }

        .rank {
          font-size: 1.25rem;
          font-weight: bold;
          color: #6b7280;
          min-width: 50px;
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
          font-weight: 600;
        }

        .player-stats .points {
          color: #fbbf24;
        }

        .player-stats .streak {
          color: #f97316;
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
