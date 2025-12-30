import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RoadmapVisualization from '../components/RoadmapVisualization';
import './LearningPath.css';

const LearningPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchLearningPath();
    }
  }, [user?._id]);

  const fetchLearningPath = async () => {
    try {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      // Fetch fresh user data to get updated assessments
      const userResponse = await api.get(`/users/${user._id}`);
      const currentUser = userResponse.data;

      if (!currentUser?.assessments || currentUser.assessments.length === 0) {
        setLoading(false);
        setLearningPath(null);
        return;
      }

      try {
        const response = await api.get(`/learning-paths/${user._id}`);
        setLearningPath(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          // Learning path doesn't exist yet
          setLearningPath(null);
        } else {
          console.error('Error fetching learning path:', error);
          toast.error('Failed to load learning path');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLearningPath(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePath = async () => {
    // Fetch fresh user data to check assessments
    try {
      const userResponse = await api.get(`/users/${user._id}`);
      const currentUser = userResponse.data;

      if (!currentUser?.assessments || currentUser.assessments.length === 0) {
        toast.error('Please complete at least one assessment first');
        navigate('/assessments');
        return;
      }

      setGenerating(true);
      const response = await api.post('/learning-paths/generate');
      setLearningPath(response.data);
      toast.success('Learning path generated successfully!');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Please complete at least one assessment first');
        navigate('/assessments');
      } else {
        console.error('Error generating learning path:', error);
        toast.error('Failed to generate learning path');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleTopicToggle = async (topicId, completed) => {
    try {
      const response = await api.put(
        `/learning-paths/${learningPath._id}/topic/${topicId}`,
        { completed: !completed }
      );
      setLearningPath(response.data);
      toast.success(
        completed
          ? 'Topic marked as incomplete'
          : 'Topic marked as completed!'
      );
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic status');
    }
  };

  const handleExportPDF = () => {
    const RoadmapVisualization = require('../components/RoadmapVisualization').default;
    // PDF export will be handled by the RoadmapVisualization component
    toast.info('PDF export feature will be available in the roadmap view');
  };

  if (loading) {
    return <LoadingSpinner message="Loading learning path..." />;
  }

  if (!learningPath) {
    return (
      <div className="learning-path-empty">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No Learning Path Yet</h2>
          <p>
            Complete at least one assessment to generate your personalized
            learning path
          </p>
          <button
            onClick={handleGeneratePath}
            disabled={generating}
            className="btn btn-primary"
          >
            {generating ? 'Generating...' : 'Generate Learning Path'}
          </button>
        </div>
      </div>
    );
  }

  const sortedTopics = [...learningPath.topics].sort((a, b) => a.order - b.order);

  return (
    <div className="learning-path-page">
      <div className="learning-path-header">
        <div>
          <h1>{learningPath.title}</h1>
          <p className="path-description">{learningPath.description}</p>
        </div>
        <div className="path-progress">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-value">
              {learningPath.progress.completedTopics} / {learningPath.progress.totalTopics} topics
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${learningPath.progress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-percentage">
            {learningPath.progress.percentage}%
          </span>
        </div>
      </div>

      <div className="learning-path-content">
        <div className="topics-list">
          <h2>Learning Topics</h2>
          {sortedTopics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-card ${topic.completed ? 'completed' : ''} ${selectedTopic?.id === topic.id ? 'selected' : ''
                }`}
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="topic-header">
                <div className="topic-checkbox">
                  <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={() => handleTopicToggle(topic.id, topic.completed)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="topic-info">
                  <h3>{topic.title}</h3>
                  <div className="topic-meta">
                    <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                      {topic.difficulty}
                    </span>
                    <span className="topic-hours">⏱ {topic.estimatedHours} hours</span>
                  </div>
                </div>
              </div>
              <p className="topic-description">{topic.description}</p>
              {topic.resources && topic.resources.length > 0 && (
                <div className="topic-resources">
                  <strong>Resources:</strong>
                  <ul>
                    {topic.resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {resource.type}: {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {topic.prerequisites && topic.prerequisites.length > 0 && (
                <div className="topic-prerequisites">
                  <strong>Prerequisites:</strong>{' '}
                  {topic.prerequisites
                    .map((prereqId) => {
                      const prereq = sortedTopics.find((t) => t.id === prereqId);
                      return prereq ? prereq.title : prereqId;
                    })
                    .join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="roadmap-visualization">
          <h2>Learning Roadmap</h2>
          <RoadmapVisualization
            topics={sortedTopics}
            onTopicSelect={setSelectedTopic}
            selectedTopic={selectedTopic}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningPath;

