import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const useTimeTracker = () => {
  const { isAuthenticated, user } = useAuth();
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Track time every 30 seconds
    intervalRef.current = setInterval(async () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      if (timeSpent >= 30) {
        try {
          await api.post('/activity/track-time', {
            seconds: timeSpent,
            timestamp: new Date().toISOString(),
          });
          startTimeRef.current = Date.now();
        } catch (error) {
          console.error('Error tracking time:', error);
        }
      }
    }, 30000); // Every 30 seconds

    // Track time on page unload
    const handleBeforeUnload = async () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        try {
          await api.post('/activity/track-time', {
            seconds: timeSpent,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error tracking time on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Final time tracking on cleanup
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0 && isAuthenticated) {
        api.post('/activity/track-time', {
          seconds: timeSpent,
          timestamp: new Date().toISOString(),
        }).catch(console.error);
      }
    };
  }, [isAuthenticated, user]);

  return null;
};

export default useTimeTracker;

