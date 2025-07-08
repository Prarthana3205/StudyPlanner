"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PomodoroTimerProps {
  className?: string;
}

export default function PomodoroTimer({ className = "" }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState<NodeJS.Timeout | null>(null);
  const [isSilenced, setIsSilenced] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      if (isSilenced) return; // Don't play if silenced
      
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // 800Hz beep
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio context error:', error);
      }
    };

    // Create a proper audio object with a play method that returns a Promise
    audioRef.current = {
      play: () => {
        if (isSilenced) return Promise.resolve(); // Don't play if silenced
        return new Promise((resolve) => {
          createBeepSound();
          setTimeout(resolve, 500); // Resolve after the beep duration
        });
      },
      stop: () => {
        // Stop method for silencing
        setIsSilenced(true);
        if (notificationInterval) {
          clearInterval(notificationInterval);
          setNotificationInterval(null);
        }
      }
    } as any;
  }, [notificationInterval, isSilenced]);

  const formatTimeDetailed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const playNotification = useCallback(() => {
    // Reset silenced flag and show notification popup
    setIsSilenced(false);
    setShowNotification(true);
    
    // Play initial sound
    if (audioRef.current && typeof audioRef.current.play === 'function') {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Start repeating sound every 3 seconds
    const interval = setInterval(() => {
      if (!isSilenced && audioRef.current && typeof audioRef.current.play === 'function') {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }, 3000);
    
    setNotificationInterval(interval);
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break time is over!' : 'Timer completed!', {
        body: isBreak ? 'Time to get back to work!' : 'Your timer has finished!',
        icon: '/favicon.ico'
      });
    }
  }, [isBreak, isSilenced]);

  const silenceNotification = useCallback(() => {
    setShowNotification(false);
    setIsSilenced(true);
    if (notificationInterval) {
      clearInterval(notificationInterval);
      setNotificationInterval(null);
    }
  }, [notificationInterval]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds;
    setTimeLeft(isBreak ? 5 * 60 : totalSeconds);
    silenceNotification(); // Clear any active notifications
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isBreak, customHours, customMinutes, customSeconds, silenceNotification]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsSilenced(false); // Reset silenced flag when starting new timer
    silenceNotification(); // Clear any existing notifications
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          playNotification();
          setIsActive(false);
          // Clear the interval when timer finishes
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0; // Set timer to 0 instead of auto-switching
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [playNotification, silenceNotification]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setCustomTime = useCallback(() => {
    const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (totalSeconds > 0 && totalSeconds <= 86400) { // Max 24 hours
      setTimeLeft(totalSeconds);
      setIsCustomizing(false);
      resetTimer();
    }
  }, [customHours, customMinutes, customSeconds, resetTimer]);

  // Initialize timer with custom time on component mount
  useEffect(() => {
    const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
    }
  }, []); // Empty dependency array to run only on mount

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, [notificationInterval]);

  return (
    <div className={`bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl p-6 border-2 border-purple-300 dark:border-purple-500 h-fit ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 text-center w-full">
          Online Timer & Stopwatch
        </h2>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-sm font-medium absolute top-4 right-4"
          title="Customize timer"
        >
          ⚙️
        </button>
      </div>

      {isCustomizing && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-600">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-purple-900 dark:text-purple-100 font-medium text-xs block mb-1">
                Hours:
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={customHours}
                onChange={(e) => setCustomHours(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-purple-300 dark:border-purple-600 rounded text-center text-purple-900 dark:text-purple-100 dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="text-purple-900 dark:text-purple-100 font-medium text-xs block mb-1">
                Minutes:
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-purple-300 dark:border-purple-600 rounded text-center text-purple-900 dark:text-purple-100 dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="text-purple-900 dark:text-purple-100 font-medium text-xs block mb-1">
                Seconds:
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-purple-300 dark:border-purple-600 rounded text-center text-purple-900 dark:text-purple-100 dark:bg-gray-700 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={setCustomTime}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setCustomHours(0);
                setCustomMinutes(25);
                setCustomSeconds(0);
                setIsCustomizing(false);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Digital Timer Display */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          {(() => {
            const time = formatTimeDetailed(timeLeft);
            return (
              <>
                {/* Hours */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none">
                    {time.hours}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 text-xs mt-1 font-medium">Hours</div>
                </div>
                
                {/* Separator */}
                <div className="text-5xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none">:</div>
                
                {/* Minutes */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none">
                    {time.minutes}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 text-xs mt-1 font-medium">Minutes</div>
                </div>
                
                {/* Separator */}
                <div className="text-5xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none">:</div>
                
                {/* Seconds */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none">
                    {time.seconds}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 text-xs mt-1 font-medium">Seconds</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-8 py-3 bg-emerald-600 text-white text-lg font-bold rounded-full hover:bg-emerald-700 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-3 bg-amber-600 text-white text-lg font-bold rounded-full hover:bg-amber-700 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="px-8 py-3 bg-purple-600 text-white text-lg font-bold rounded-full hover:bg-purple-700 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Reset
          </button>
        </div>

        {/* Timer Info */}
        <div className="text-purple-600 dark:text-purple-400 text-xs">
          🎯 Work: {customHours.toString().padStart(2, '0')}:{customMinutes.toString().padStart(2, '0')}:{customSeconds.toString().padStart(2, '0')} • 💚 Break: 5min • {isBreak ? "Take a break!" : "Stay focused!"}
        </div>
      </div>

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-purple-300 dark:border-purple-500 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                Timer Finished!
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-6">
                Your timer has completed. Time to take a break or start your next task!
              </p>
              <button
                onClick={silenceNotification}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🔇 Silence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
