import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RoadmapVisualization from '../components/RoadmapVisualization';
import ReviewSection from '../components/ReviewSection';
import Leaderboard from '../components/Leaderboard';
import { FiMap, FiCheckCircle, FiCircle, FiClock, FiBook, FiTrendingUp, FiExternalLink, FiVideo, FiYoutube } from 'react-icons/fi';
import './LearningPath.css';
import FixedFooter from '../components/FixedFooter';

const LearningPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicVideos, setTopicVideos] = useState({});
  const [activeTab, setActiveTab] = useState('topics'); // 'topics', 'videos', 'docs', 'leaderboard'


  const fetchLearningPath = React.useCallback(async () => {
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
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchLearningPath();
    }
  }, [user?._id, fetchLearningPath]);

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

  const getSubjectFromTopic = React.useCallback((topic) => {
    // Extract subject from topic title or description
    const title = topic.title.toLowerCase();
    if (title.includes('javascript') || title.includes('js')) return 'JavaScript';
    if (title.includes('react')) return 'React';
    if (title.includes('node') || title.includes('express')) return 'Node.js';
    if (title.includes('database') || title.includes('sql') || title.includes('mongodb')) return 'Databases';
    if (title.includes('python')) return 'Python';

    // Default: try to get from learning path assessment results
    if (learningPath?.assessmentResults) {
      const subjects = Object.keys(learningPath.assessmentResults);
      return subjects[0] || 'JavaScript';
    }

    return 'JavaScript';
  }, [learningPath]);

  const fetchTopicVideos = React.useCallback(async (topic) => {
    try {
      // Try to get videos by topicId first, then by subject and difficulty
      let response;
      try {
        response = await api.get(`/videos/topic/${topic.id}`);
      } catch (error) {
        // If no videos found by topicId, try by subject and difficulty
        const subject = getSubjectFromTopic(topic);
        response = await api.get(`/videos?subject=${subject}&difficulty=${topic.difficulty}`);
      }

      setTopicVideos(prev => ({
        ...prev,
        [topic.id]: response.data,
      }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Try fallback: get videos by subject only
      try {
        const subject = getSubjectFromTopic(topic);
        const response = await api.get(`/videos?subject=${subject}`);
        setTopicVideos(prev => ({
          ...prev,
          [topic.id]: response.data,
        }));
      } catch (fallbackError) {
        console.error('Error fetching videos (fallback):', fallbackError);
      }
    }
  }, [getSubjectFromTopic]);

  // Prefetch videos for the top 3 topics so we can show suggested videos
  useEffect(() => {
    if (learningPath?.topics && learningPath.topics.length > 0) {
      const topTopics = [...learningPath.topics].sort((a, b) => a.order - b.order).slice(0, 3);
      topTopics.forEach((t) => {
        if (!topicVideos[t.id]) {
          fetchTopicVideos(t);
        }
      });
    }
  }, [learningPath, fetchTopicVideos, topicVideos]);

  const handleVideoSelect = (video) => {
    // Open YouTube video in new tab
    if (video.videoId) {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
    } else if (video.url) {
      window.open(video.url, '_blank');
    }
  };

  // Removed time-watched badge auto display per design request


  const docs = [
    {
      category: 'JavaScript',
      resources: [
        { title: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'Documentation' },
        { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'Tutorial' },
        { title: 'ES6 Features', url: 'https://es6-features.org/', type: 'Reference' },
      ],
    },
    {
      category: 'React',
      resources: [
        { title: 'React Official Docs', url: 'https://react.dev/', type: 'Documentation' },
        { title: 'React Router', url: 'https://reactrouter.com/', type: 'Documentation' },
        { title: 'React Hooks Guide', url: 'https://react.dev/reference/react', type: 'Reference' },
      ],
    },
    {
      category: 'Node.js',
      resources: [
        { title: 'Node.js Official Docs', url: 'https://nodejs.org/docs/', type: 'Documentation' },
        { title: 'Express.js Guide', url: 'https://expressjs.com/', type: 'Documentation' },
      ],
    },
    {
      category: 'Databases',
      resources: [
        { title: 'MongoDB Manual', url: 'https://docs.mongodb.com/', type: 'Documentation' },
        { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'Tutorial' },
      ],
    },
    {
      category: 'Python',
      resources: [
        { title: 'Python Official Docs', url: 'https://docs.python.org/3/', type: 'Documentation' },
        { title: 'Real Python', url: 'https://realpython.com/', type: 'Tutorial' },
      ],
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading learning path..." />;
  }

  if (!learningPath) {
    return (
      <div className="learning-path-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <FiBook />
          </div>
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
    <>
      <div className="learning-path-page page-with-footer">
        {/* time-watched-badge removed per user request */}
        <div className="learning-path-header">
          <div className="header-content">
            <div className="header-icon-wrapper">
              <FiMap className="header-icon" />
            </div>
            <div>
              <h1>{learningPath.title}</h1>
              <p className="path-description">{learningPath.description}</p>
            </div>
          </div>
          <div className="path-progress">
            <div className="progress-info">
              <span className="progress-label">
                <FiTrendingUp className="progress-icon" />
                Progress
              </span>
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

        <div className="learning-path-tabs">
          <button
            className={`tab-button ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
          </button>
          <button
            className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`tab-button ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            Documentation
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'topics' && (
          <div className="learning-path-content">
            <div className="topics-list">
              <h2>Learning Topics</h2>
              {sortedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`topic-card ${topic.completed ? 'completed' : ''} ${selectedTopic?.id === topic.id ? 'selected' : ''
                    }`}
                  onClick={() => {
                    setSelectedTopic(topic);
                    if (!topicVideos[topic.id]) {
                      fetchTopicVideos(topic);
                    }
                  }}
                >
                  <div className="topic-header">
                    <div className="topic-checkbox">
                      {topic.completed ? (
                        <FiCheckCircle className="checkbox-icon completed" />
                      ) : (
                        <FiCircle className="checkbox-icon" />
                      )}
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => handleTopicToggle(topic.id, topic.completed)}
                        onClick={(e) => e.stopPropagation()}
                        className="checkbox-input"
                      />
                    </div>
                    <div className="topic-info">
                      <h3>{topic.title}</h3>
                      <div className="topic-meta">
                        <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                          {topic.difficulty}
                        </span>
                        <span className="topic-hours">
                          <FiClock className="hours-icon" />
                          {topic.estimatedHours} hours
                        </span>
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
                  {topicVideos[topic.id] && topicVideos[topic.id].length > 0 && (
                    <div className="topic-videos-preview">
                      <strong>Videos ({topicVideos[topic.id].length}):</strong>
                      <div className="videos-mini-list">
                        {topicVideos[topic.id].slice(0, 2).map((video) => (
                          <button
                            key={video._id}
                            className="video-mini-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoSelect(video);
                            }}
                          >
                            <FiVideo className="video-icon" />
                            <span>{video.title}</span>
                          </button>
                        ))}
                        {topicVideos[topic.id].length > 2 && (
                          <button
                            className="video-mini-card view-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopic(topic);
                              setActiveTab('videos');
                            }}
                          >
                            +{topicVideos[topic.id].length - 2} more
                          </button>
                        )}
                      </div>
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
        )}

        {activeTab === 'videos' && (
          <div className="videos-tab-content">
            {selectedTopic ? (
              <div>
                <h2>Videos for: {selectedTopic.title}</h2>
                {topicVideos[selectedTopic.id] && topicVideos[selectedTopic.id].length > 0 ? (
                  <div className="videos-grid">
                    {topicVideos[selectedTopic.id].map((video) => {
                      const videoId = video.videoId || (video.url ? video.url.split('v=')[1]?.split('&')[0] : null);
                      const thumbnail = video.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');
                      const ytUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (video.videoUrl || video.url || '#');
                      const shortDesc = video.description ? (video.description.length > 160 ? `${video.description.slice(0, 157)}...` : video.description) : 'Click to watch on YouTube';

                      return (
                        <div
                          key={video._id}
                          className="video-card"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="video-thumbnail">
                            {thumbnail && <img src={thumbnail} alt={video.title} />}
                            <div className="play-overlay">
                              <FiYoutube className="youtube-icon" />
                              <span>Watch on YouTube</span>
                            </div>
                            {video.duration && (
                              <div className="video-duration">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                          <div className="video-card-content">
                            <h3>{video.title}</h3>
                            <p className="video-short-desc">{shortDesc}</p>
                            <div className="video-card-meta">
                              <span className={`difficulty-badge ${(video.difficulty || 'Beginner').toLowerCase()}`}>
                                {video.difficulty || 'Beginner'}
                              </span>
                              <span className="youtube-link">
                                <FiYoutube /> YouTube
                              </span>
                            </div>
                            <div className="video-links">
                              <a href={ytUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn btn-outline">
                                Open on YouTube
                              </a>
                              <a href={ytUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="video-link-detail">
                                View details
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-videos">
                    <FiVideo className="no-videos-icon" />
                    <p>No videos available for this topic yet.</p>
                    <p>Select a different topic or check back later!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="suggested-topics">
                <h3>Suggested topics & videos</h3>
                <p className="suggested-intro">We recommend these topics based on your learning path — click a video to open it on YouTube.</p>
                <div className="suggested-topics-list">
                  {sortedTopics.slice(0, 3).map((topic) => (
                    <div key={topic.id} className="suggested-topic-card">
                      <div className="suggested-topic-header">
                        <h4>{topic.title}</h4>
                        <span className={`difficulty-badge ${topic.difficulty?.toLowerCase() || 'beginner'}`}>{topic.difficulty || 'Beginner'}</span>
                      </div>
                      {topic.description && <p className="topic-short">{topic.description}</p>}

                      {topicVideos[topic.id] && topicVideos[topic.id].length > 0 ? (
                        <ul className="suggested-videos">
                          {topicVideos[topic.id].slice(0, 3).map((v) => {
                            const vid = v.videoId || (v.url ? v.url.split('v=')[1]?.split('&')[0] : null);
                            const link = vid ? `https://www.youtube.com/watch?v=${vid}` : (v.videoUrl || v.url || '#');
                            return (
                              <li key={v._id} className="suggested-video-item">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                  {v.title}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="no-suggested-videos">
                          <p>No curated videos available yet for this topic.</p>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(getSubjectFromTopic(topic))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Search on YouTube for {getSubjectFromTopic(topic)}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="docs-tab-content">
            <h2>📚 Learning Resources & Documentation</h2>
            <div className="docs-grid">
              {docs.map((category, index) => (
                <div key={index} className="docs-category">
                  <h3 className="category-title">{category.category}</h3>
                  <div className="resources-list">
                    {category.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-item"
                      >
                        <FiBook className="resource-icon" />
                        <div className="resource-content">
                          <h4>{resource.title}</h4>
                          <span className="resource-type">{resource.type}</span>
                        </div>
                        <FiExternalLink className="external-icon" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab-content">
            <Leaderboard compact={false} />
          </div>
        )}
        {/* Collect feedback for the generated learning path */}
        <div style={{ marginTop: '2rem' }}>
          <ReviewSection type="learningPath" targetId={learningPath?._id} />
        </div>
      </div>
      {/* fixed footer added so it remains visible */}
      <FixedFooter />
    </>
  );
};

export default LearningPath;

