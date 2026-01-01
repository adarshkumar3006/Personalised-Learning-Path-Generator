import React, { useEffect, useState, useRef, useCallback } from 'react';
import './TimeVisualization.css';
import api from '../services/api';

const TimeVisualization = ({ weeklyTime = { hours: 0, minutes: 0 }, totalTime = { hours: 0, minutes: 0 }, onClose }) => {
   const [bars, setBars] = useState(Array.from({ length: 24 }, (_, i) => ({ hour: i, minutes: 0 })));
   const mounted = useRef(false);

   const fetchHourly = useCallback(async () => {
      try {
         const resp = await api.get('/activity/stats');
         const hourly = resp.data.hourlyUsage || resp.data.weeklyStats?.hourly || Array.from({ length: 24 }, () => 0);
         // hourly are seconds per hour; convert to minutes and round
         const minuteBars = hourly.map((s, i) => ({ hour: i, minutes: Math.round((s || 0) / 60) }));
         setBars(minuteBars);
      } catch (err) {
         // fallback to distribution from totalTime
         const totalMinutes = (totalTime.hours || 0) * 60 + (totalTime.minutes || 0);
         const weights = Array.from({ length: 24 }, (_, i) => {
            if (i >= 9 && i <= 11) return 3;
            if (i >= 15 && i <= 17) return 3;
            if (i >= 19 && i <= 21) return 2;
            if (i >= 6 && i <= 8) return 1;
            return 0.5;
         });
         const weightSum = weights.reduce((a, b) => a + b, 0);
         const minuteBars = weights.map((w, i) => ({ hour: i, minutes: Math.round((w / weightSum) * totalMinutes) }));
         setBars(minuteBars);
      }
   }, [totalTime]);

   useEffect(() => {
      mounted.current = true;
      fetchHourly();
      // Poll every hour to update graph (3600000 ms)
      const id = setInterval(() => {
         if (mounted.current) fetchHourly();
      }, 60 * 60 * 1000);
      return () => {
         mounted.current = false;
         clearInterval(id);
      };
   }, [fetchHourly]);

   const maxMin = Math.max(...bars.map((b) => b.minutes)) || 1;

   return (
      <div className="tv-overlay">
         <div className="tv-modal">
            <button className="tv-close" onClick={onClose}>✕</button>
            <h3>Time Spent — Today</h3>
            <div className="tv-chart">
               {bars.map((b) => {
                  const heightPct = Math.round((b.minutes / maxMin) * 100);
                  const isNow = new Date().getHours() === b.hour;
                  return (
                     <div key={b.hour} className={`tv-bar-wrapper ${isNow ? 'tv-now' : ''}`}>
                        <div className="tv-bar" style={{ height: `${heightPct}%` }} title={`${b.hour}:00 — ${b.minutes}m`}>
                           <div className="tv-bar-label">{b.minutes}m</div>
                        </div>
                        <div className="tv-hour">{b.hour}</div>
                     </div>
                  );
               })}
            </div>

            <div className="tv-summary">
               <div>
                  <strong>Total</strong>
                  <div>{totalTime.hours}h {totalTime.minutes}m</div>
               </div>
               <div>
                  <strong>This Week</strong>
                  <div>{weeklyTime.hours}h {weeklyTime.minutes}m</div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default TimeVisualization;
