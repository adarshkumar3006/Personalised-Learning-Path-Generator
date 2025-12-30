import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiClipboard, FiClock, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import './Assessments.css';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

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
    <div className="assessments-page">
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
          {assessments.map((assessment) => (
            <div key={assessment._id} className="assessment-card">
              <div className="assessment-header">
                <div className="assessment-icon">
                  <FiClipboard />
                </div>
                <div className="assessment-title-section">
                  <h3>{assessment.title}</h3>
                  <p className="assessment-subject">{assessment.subject}</p>
                </div>
                <span className={`difficulty-badge ${assessment.difficulty.toLowerCase()}`}>
                  {assessment.difficulty}
                </span>
              </div>
              <p className="assessment-description">{assessment.description}</p>
              <div className="assessment-meta">
                <span className="meta-item">
                  <FiClock className="meta-icon" />
                  {assessment.duration} minutes
                </span>
                <span className="meta-item">
                  <FiHelpCircle className="meta-icon" />
                  {assessment.questions?.length || 0} questions
                </span>
              </div>
              <Link
                to={`/assessments/${assessment._id}`}
                className="btn btn-primary"
              >
                <span>Start Assessment</span>
                <FiArrowRight className="btn-icon" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assessments;

