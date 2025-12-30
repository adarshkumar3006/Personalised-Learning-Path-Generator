import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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
      <h1>Skill Assessments</h1>
      <p className="page-subtitle">
        Test your knowledge in various subjects to generate a personalized learning path
      </p>

      {assessments.length === 0 ? (
        <div className="no-assessments">
          <p>No assessments available at the moment.</p>
        </div>
      ) : (
        <div className="assessments-grid">
          {assessments.map((assessment) => (
            <div key={assessment._id} className="assessment-card">
              <div className="assessment-header">
                <h3>{assessment.title}</h3>
                <span className={`difficulty-badge ${assessment.difficulty.toLowerCase()}`}>
                  {assessment.difficulty}
                </span>
              </div>
              <p className="assessment-subject">Subject: {assessment.subject}</p>
              <p className="assessment-description">{assessment.description}</p>
              <div className="assessment-meta">
                <span>⏱ {assessment.duration} minutes</span>
                <span> {assessment.questions?.length || 0} questions</span>
              </div>
              <Link
                to={`/assessments/${assessment._id}`}
                className="btn btn-primary"
              >
                Start Assessment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assessments;

