import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { FiAward, FiStar } from 'react-icons/fi';
import './Leaderboard.css';

const Leaderboard = ({ compact = false }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const endpoint = compact ? '/leaderboard/top3' : '/leaderboard';
      const response = await api.get(endpoint);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FiAward className="rank-icon gold" />;
      case 2:
        return <FiStar className="rank-icon silver" />;
      case 3:
        return <FiAward className="rank-icon bronze" />;
      default:
        return <span className="rank-number">{rank}</span>;
    }
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>No rankings yet. Be the first to earn points!</p>
      </div>
    );
  }

  return (
    <div className={`leaderboard-container ${compact ? 'compact' : ''}`}>
      <h3 className="leaderboard-title">
        {compact ? '🏆 Top 3 This Week' : 'Weekly Leaderboard'}
      </h3>
      <div className="leaderboard-list">
        {leaderboard.map((entry, index) => (
          <div
            key={entry._id || index}
            className={`leaderboard-item ${entry.rank <= 3 ? 'top-three' : ''}`}
          >
            <div className="rank-section">
              {getRankIcon(entry.rank)}
            </div>
            <div className="user-info">
              <div className="user-name">{entry.userName || entry.userId?.name}</div>
              <div className="user-stats">
                <span>⭐ {entry.points} pts</span>
                <span>⏱ {formatTime(entry.weeklyTimeSpent || 0)}</span>
                <span>📹 {entry.videosWatched || 0} videos</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

