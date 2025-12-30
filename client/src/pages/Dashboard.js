import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FiClipboard, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiArrowRight,
  FiUser,
  FiMap
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    learningPathProgress: 0,
    topicsCompleted: 0,
    totalTopics: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // First ensure we have user data
      let currentUserId = user?._id;
      if (!currentUserId) {
        await fetchUser();
        currentUserId = user?._id;
      }

      if (!currentUserId) {
        setLoading(false);
        return;
      }

      // Fetch fresh user data with assessments populated
      const userResponse = await api.get(`/users/${currentUserId}`);
      const currentUser = userResponse.data;

      // Update auth context with fresh user data
      if (currentUser) {
        await fetchUser();
      }

      const assessmentsCount = currentUser?.assessments?.length || 0;

      if (currentUser?.learningPath) {
        const response = await api.get(`/learning-paths/${currentUser._id}`);
        const learningPath = response.data;

        setStats({
          assessmentsCompleted: assessmentsCount,
          learningPathProgress: learningPath.progress?.percentage || 0,
          topicsCompleted: learningPath.progress?.completedTopics || 0,
          totalTopics: learningPath.progress?.totalTopics || 0,
        });
      } else {
        setStats({
          assessmentsCompleted: assessmentsCount,
          learningPathProgress: 0,
          topicsCompleted: 0,
          totalTopics: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to user from context
      setStats({
        assessmentsCompleted: user?.assessments?.length || 0,
        learningPathProgress: 0,
        topicsCompleted: 0,
        totalTopics: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>

      <div className="stats-grid">
        <Link to="/assessments" className="stat-card stat-card-primary">
          <div className="stat-icon">
            <FiClipboard />
          </div>
          <div className="stat-content">
            <h3>{stats.assessmentsCompleted}</h3>
            <p>Assessments Completed</p>
          </div>
          <FiArrowRight className="stat-arrow" />
        </Link>

        <Link to="/learning-path" className="stat-card stat-card-success">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.learningPathProgress}%</h3>
            <p>Learning Path Progress</p>
          </div>
          <FiArrowRight className="stat-arrow" />
        </Link>

        <Link to="/learning-path" className="stat-card stat-card-info">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.topicsCompleted}/{stats.totalTopics}</h3>
            <p>Topics Completed</p>
          </div>
          <FiArrowRight className="stat-arrow" />
        </Link>
      </div>

      <div className="dashboard-actions">
        <Link to="/assessments" className="action-card action-card-primary">
          <div className="action-icon">
            <FiClipboard />
          </div>
          <div className="action-content">
            <h3>Take Assessment</h3>
            <p>Test your skills in various subjects</p>
          </div>
          <FiArrowRight className="action-arrow" />
        </Link>

        {stats.assessmentsCompleted > 0 ? (
          user?.learningPath ? (
            <Link to="/learning-path" className="action-card action-card-success">
              <div className="action-icon">
                <FiMap />
              </div>
              <div className="action-content">
                <h3>View Learning Path</h3>
                <p>See your personalized roadmap</p>
              </div>
              <FiArrowRight className="action-arrow" />
            </Link>
          ) : (
            <Link to="/learning-path" className="action-card action-card-success">
              <div className="action-icon">
                <FiMap />
              </div>
              <div className="action-content">
                <h3>Generate Learning Path</h3>
                <p>Click to generate your personalized path</p>
              </div>
              <FiArrowRight className="action-arrow" />
            </Link>
          )
        ) : (
          <div className="action-card action-card-disabled">
            <div className="action-icon">
              <FiMap />
            </div>
            <div className="action-content">
              <h3>Generate Learning Path</h3>
              <p>Complete assessments first to generate your path</p>
            </div>
          </div>
        )}

        <Link to="/profile" className="action-card action-card-info">
          <div className="action-icon">
            <FiUser />
          </div>
          <div className="action-content">
            <h3>View Profile</h3>
            <p>See your assessment history</p>
          </div>
          <FiArrowRight className="action-arrow" />
        </Link>
      </div>

      {stats.assessmentsCompleted > 0 && (
        <div className="recent-assessments">
          <h2>Recent Assessments</h2>
          <div className="assessments-list">
            {(user?.assessments || []).slice(0, 3).map((assessment, index) => (
              <div key={index} className="assessment-item">
                <div className="assessment-info">
                  <h4>{assessment.assessmentId?.title || 'Assessment'}</h4>
                  <p>Score: {assessment.score}%</p>
                </div>
                <div className="assessment-date">
                  {new Date(assessment.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

