import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      await fetchUser();
      if (user?._id) {
        const response = await api.get(`/users/${user._id}`);
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id, fetchUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!userData) {
    return <div className="error-message">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-section">
        <h2>Personal Information</h2>
        <div className="profile-card">
          <div className="profile-field">
            <label>Name</label>
            <p>{userData.name}</p>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <p>{userData.email}</p>
          </div>
          <div className="profile-field">
            <label>Member Since</label>
            <p>{new Date(userData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {userData.assessments && userData.assessments.length > 0 && (
        <div className="profile-section">
          <h2>Assessment History</h2>
          <div className="assessments-history">
            {userData.assessments.map((assessment, index) => (
              <div key={index} className="assessment-history-item">
                <div className="assessment-history-header">
                  <h3>
                    {assessment.assessmentId?.title || 'Assessment'}
                  </h3>
                  <span className={`score-badge score-${getScoreLevel(assessment.score)}`}>
                    {assessment.score}%
                  </span>
                </div>
                <div className="assessment-history-details">
                  <p>
                    <strong>Subject:</strong>{' '}
                    {assessment.assessmentId?.subject || 'N/A'}
                  </p>
                  <p>
                    <strong>Completed:</strong>{' '}
                    {new Date(assessment.completedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Correct Answers:</strong>{' '}
                    {assessment.answers?.filter((a) => a.isCorrect).length || 0} /{' '}
                    {assessment.answers?.length || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userData.learningPath && (
        <div className="profile-section">
          <h2>Learning Path Summary</h2>
          <div className="learning-path-summary">
            <div className="summary-stat">
              <span className="stat-value">
                {userData.learningPath.progress.completedTopics} /{' '}
                {userData.learningPath.progress.totalTopics}
              </span>
              <span className="stat-label">Topics Completed</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">
                {userData.learningPath.progress.percentage}%
              </span>
              <span className="stat-label">Overall Progress</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">
                {userData.learningPath.topics?.length || 0}
              </span>
              <span className="stat-label">Total Topics</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getScoreLevel = (score) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

export default Profile;

