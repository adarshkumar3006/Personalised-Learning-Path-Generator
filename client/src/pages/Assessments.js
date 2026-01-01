import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiClipboard, FiClock, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import './Assessments.css';
import FixedFooter from '../components/FixedFooter';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);
  const statusFilter = params.get('status');

  useEffect(() => {
    // If asking for completed assessments, show user's completed items instead of global list
    if (statusFilter === 'completed') {
      setAssessments(user?.assessments || []);
      setLoading(false);
    } else {
      fetchAssessments();
    }
  }, [statusFilter, user]);

  const fetchAssessments = async () => {
    try {
      const response = await api.get('/assessments');
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assessments..." />;
  }

  return (
    <>
      <div className="assessments-page page-with-footer">
        <div className="page-header">
          <div className="header-icon">
            <FiClipboard />
          </div>
          <div>
            <h1>Skill Assessments</h1>
            <p className="page-subtitle">
              Test your knowledge in various subjects to generate a personalized learning path
            </p>
          </div>
        </div>

        {assessments.length === 0 ? (
          <div className="no-assessments">
            <FiClipboard className="empty-icon" />
            <p>No assessments available at the moment.</p>
          </div>
        ) : (
          <div className="assessments-grid">
            {assessments.map((assessment) => {
              // If the list comes from user.assessments it may have a nested assessmentId
              const source = assessment.assessmentId || assessment;
              const isUserRecord = !!assessment.assessmentId;
              return (
                <div key={assessment._id || source._id} className="assessment-card">
                  <div className="assessment-header">
                    <div className="assessment-icon">
                      <FiClipboard />
                    </div>
                    <div className="assessment-title-section">
                      <h3>{source.title}</h3>
                      <p className="assessment-subject">{source.subject}</p>
                    </div>
                    <span className={`difficulty-badge ${(source.difficulty || 'beginner').toLowerCase()}`}>
                      {source.difficulty || 'Beginner'}
                    </span>
                  </div>
                  {isUserRecord && (
                    <div className="assessment-user-result">
                      <strong>Score:</strong> {assessment.score}%
                      <span style={{ marginLeft: 12 }}>{new Date(assessment.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <p className="assessment-description">{source.description}</p>
                  <div className="assessment-meta">
                    <span className="meta-item">
                      <FiClock className="meta-icon" />
                      {source.duration} minutes
                    </span>
                    <span className="meta-item">
                      <FiHelpCircle className="meta-icon" />
                      {source.questions?.length || 0} questions
                    </span>
                  </div>
                  <Link
                    to={`/assessments/${source._id}`}
                    className="btn btn-primary"
                  >
                    <span>{isUserRecord ? 'View' : 'Start'} Assessment</span>
                    <FiArrowRight className="btn-icon" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <FixedFooter />
    </>
  );
};

export default Assessments;

