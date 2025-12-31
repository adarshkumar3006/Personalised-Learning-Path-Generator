import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './VideoPlayer.css';

const VideoPlayer = ({ video, onProgressUpdate, userId }) => {
  const [progress, setProgress] = useState(0);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const videoRef = useRef(null);
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const pendingSeekRef = useRef(null);

  const loadVideoProgress = useCallback(async () => {
    if (!userId || !video?._id) return;

    try {
      const response = await api.get(`/users/${userId}`);
      const user = response.data;
      const videoProgress = user.videoProgress?.find(
        vp => vp.videoId === video._id
      );

      if (videoProgress && videoRef.current) {
        const savedProgress = videoProgress.watchedDuration / videoProgress.totalDuration;
        setProgress(savedProgress * 100);
        setWatchedDuration(videoProgress.watchedDuration);
        // If it's a normal HTML5 video element, set currentTime directly
        if (videoRef.current && typeof videoRef.current.currentTime === 'number') {
          videoRef.current.currentTime = videoProgress.watchedDuration;
        }

        // If it's a YouTube player, seek when player is ready
        if (video.provider === 'YouTube') {
          pendingSeekRef.current = videoProgress.watchedDuration;
          if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
            try {
              ytPlayerRef.current.seekTo(videoProgress.watchedDuration, true);
              pendingSeekRef.current = null;
            } catch (err) {
              console.warn('YT seek failed, will try on ready', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  }, [userId, video?._id]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      if (!mounted) return;
      // Load saved progress
      await loadVideoProgress();

      // If it's a YouTube video, initialize player via IFrame API
      if (video?.provider === 'YouTube' && ytContainerRef.current) {
        await loadYouTubeAPI();

        // destroy previous player if exists
        if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
          try { ytPlayerRef.current.destroy(); } catch (e) { }
          ytPlayerRef.current = null;
        }

        ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
          height: '100%',
          width: '100%',
          videoId: video.videoId,
          playerVars: {
            origin: window.location.origin,
            enablejsapi: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              // Seek if there's pending saved time
              if (pendingSeekRef.current && event.target && event.target.seekTo) {
                try {
                  event.target.seekTo(pendingSeekRef.current, true);
                  pendingSeekRef.current = null;
                } catch (err) {
                  console.warn('YT seek on ready failed', err);
                }
              }
            },
            onStateChange: (e) => {
              const YT = window.YT;
              // YT.PlayerState.PLAYING === 1, PAUSED === 2, ENDED === 0
              if (e.data === YT.PlayerState.PLAYING) {
                // start polling every 5s
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = setInterval(async () => {
                  try {
                    const current = ytPlayerRef.current.getCurrentTime();
                    const dur = ytPlayerRef.current.getDuration() || video.duration || 0;
                    const percent = dur ? (current / dur) * 100 : 0;
                    setProgress(percent);
                    setWatchedDuration(current);
                    // only update server every 5s
                    await updateProgress(current, dur);
                  } catch (err) {
                    console.error('YT polling error', err);
                  }
                }, 5000);
              } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.BUFFERING) {
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
              } else if (e.data === YT.PlayerState.ENDED) {
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                handleEnded();
              }
            }
          }
        });
      }
    };

    setup();

    return () => {
      mounted = false;
      const intervalRef = progressIntervalRef.current;
      if (intervalRef) {
        clearInterval(intervalRef);
      }
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try { ytPlayerRef.current.destroy(); } catch (e) { }
        ytPlayerRef.current = null;
      }
    };
  }, [video, loadVideoProgress]);

  const handleProgress = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;

      setProgress(progressPercent);
      setWatchedDuration(currentTime);

      // Update progress every 5 seconds
      if (Math.floor(currentTime) % 5 === 0) {
        updateProgress(currentTime, duration);
      }
    }
  };

  const updateProgress = async (currentTime, duration) => {
    if (!userId || !video?._id) return;

    try {
      await api.post(`/videos/${video._id}/progress`, {
        watchedDuration: currentTime,
        totalDuration: duration,
      });

      if (onProgressUpdate) {
        onProgressUpdate({
          watchedDuration: currentTime,
          totalDuration: duration,
          progress: (currentTime / duration) * 100,
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Load YouTube IFrame API and return a promise
  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve();

      const existing = document.getElementById('youtube-iframe-api');
      if (existing) {
        // wait for global ready
        const interval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'youtube-iframe-api';
      document.body.appendChild(tag);

      // YouTube API will call this global
      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
    });
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * videoRef.current.duration;

    videoRef.current.currentTime = newTime;
    setProgress(pos * 100);
    setWatchedDuration(newTime);
    updateProgress(newTime, videoRef.current.duration);
  };

  const handleTimeUpdate = () => {
    handleProgress();
  };

  const handleEnded = async () => {
    try {
      let duration = video.duration || 0;
      if (video.provider === 'YouTube' && ytPlayerRef.current && ytPlayerRef.current.getDuration) {
        duration = ytPlayerRef.current.getDuration();
      } else if (videoRef.current && videoRef.current.duration) {
        duration = videoRef.current.duration;
      }
      if (userId && video?._id) {
        await updateProgress(duration, duration);
        toast.success('Video completed! You earned 10 points!');
      }
    } catch (err) {
      console.error('Error handling ended', err);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
  };

  if (!video) {
    return <div className="video-player-empty">No video selected</div>;
  }

  const openOnYouTubeUrl = (video) => {
    if (video?.provider === 'YouTube' && video?.videoId) {
      return `https://www.youtube.com/watch?v=${video.videoId}`;
    }
    return video?.videoUrl || '#';
  };

  const markAsWatched = async () => {
    if (!videoRef.current && !video) return;

    // For both iframe YouTube and video elements, mark full duration as watched
    const total = video?.duration || (videoRef.current?.duration || 0);
    try {
      await updateProgress(total, total);
      toast.success('Marked as watched — progress updated');
      setProgress(100);
      setWatchedDuration(total);
    } catch (err) {
      console.error('Error marking watched', err);
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        {video.provider === 'YouTube' ? (
          // Container for YouTube iframe player created by API
          <div
            ref={ytContainerRef}
            id={`youtube-player-${video._id}`}
            className="video-iframe"
          />
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="video-element"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleProgress}
            controls
          />
        )}
      </div>

      <div className="video-info">
        <h3>{video.title}</h3>
        <p className="video-description">{video.description}</p>
        <div className="video-meta">
          <span className="video-duration">⏱ {formatTime(video.duration)}</span>
          <span className="video-views">👁 {video.views || 0} views</span>
          <span className="video-rating">⭐ {video.rating?.average?.toFixed(1) || '0.0'}</span>
        </div>

        <div className="video-actions">
          <a
            className="btn btn-outline"
            href={openOnYouTubeUrl(video)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on YouTube
          </a>
          <button className="btn btn-primary" onClick={markAsWatched}>Mark as Watched</button>
        </div>
      </div>

      <div className="video-progress-section">
        <div className="progress-label">
          <span>Progress: {progress.toFixed(1)}%</span>
          <span>{formatTime(watchedDuration)} / {formatTime(video.duration)}</span>
        </div>
        <div className="progress-bar-container" onClick={handleSeek}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

