import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import './LearningPath.css';

const TopicsCompleted = () => {
   const { user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [topics, setTopics] = useState([]);

   useEffect(() => {
      const fetch = async () => {
         try {
            if (!user?._id) return setLoading(false);
            const resp = await api.get(`/learning-paths/${user._id}`);
            const lp = resp.data;
            const completed = (lp.topics || []).filter(t => t.completed);
            setTopics(completed);
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      fetch();
   }, [user?._id]);

   if (loading) return <LoadingSpinner message="Loading completed topics..." />;

   return (
      <div className="learning-path-page page-with-footer">
         <div className="learning-path-header">
            <div className="header-content">
               <div className="header-icon-wrapper"><FiCheckCircle className="header-icon" /></div>
               <div>
                  <h1>Completed Topics</h1>
                  <p className="path-description">Topics you've completed from your learning path</p>
               </div>
            </div>
         </div>

         <div style={{ marginTop: '1rem' }}>
            {topics.length === 0 ? (
               <div className="empty-state">
                  <div className="empty-icon"><FiClock /></div>
                  <h3>No topics completed yet</h3>
                  <p>Complete topics in your learning path to see them here.</p>
               </div>
            ) : (
               <div className="topics-list">
                  {topics.map(t => (
                     <div key={t.id} className="topic-card completed">
                        <div className="topic-header">
                           <div className="topic-info">
                              <h3>{t.title}</h3>
                              <div className="topic-meta">
                                 <span className={`difficulty-badge ${t.difficulty?.toLowerCase()}`}>{t.difficulty}</span>
                                 <span className="topic-hours"><FiClock className="hours-icon" /> {t.estimatedHours} hours</span>
                              </div>
                           </div>
                        </div>
                        <p className="topic-description">{t.description}</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default TopicsCompleted;
