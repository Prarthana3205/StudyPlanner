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

  const updateTimeAndTimer = useCallback((hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds >= 0 && totalSeconds <= 86400) {
      setTimeLeft(totalSeconds);
    }
  }, []);

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
    <div className={`bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl p-4 border-2 border-purple-300 dark:border-purple-500 h-fit ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <h2 className="text-base font-bold text-purple-900 dark:text-purple-100 text-center">
          Timer
        </h2>
      </div>

      {/* Timer Display with Arrow Controls - Center */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 relative py-6">
            {(() => {
              const time = formatTimeDetailed(timeLeft);
              return (
                <>
                  {/* Hours */}
                  <div className="text-center relative flex flex-col items-center">
                    {/* Up Arrow for Hours */}
                    <button
                      onClick={() => {
                        const newHours = Math.min(23, customHours + 2);
                        setCustomHours(newHours);
                        updateTimeAndTimer(newHours, customMinutes, customSeconds);
                      }}
                      className="mb-2 w-8 h-6 bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▲
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none mb-1">
                        {time.hours}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs font-medium">HR</div>
                    </div>
                    {/* Down Arrow for Hours */}
                    <button
                      onClick={() => {
                        const newHours = Math.max(0, customHours - 2);
                        setCustomHours(newHours);
                        updateTimeAndTimer(newHours, customMinutes, customSeconds);
                      }}
                      className="mt-2 w-8 h-6 bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▼
                    </button>
                  </div>
                  
                  {/* Separator */}
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none self-center">:</div>
                  
                  {/* Minutes */}
                  <div className="text-center relative flex flex-col items-center">
                    {/* Up Arrow for Minutes */}
                    <button
                      onClick={() => {
                        const newMinutes = Math.min(59, customMinutes + 2);
                        setCustomMinutes(newMinutes);
                        updateTimeAndTimer(customHours, newMinutes, customSeconds);
                      }}
                      className="mb-2 w-8 h-6 bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▲
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none mb-1">
                        {time.minutes}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs font-medium">MIN</div>
                    </div>
                    {/* Down Arrow for Minutes */}
                    <button
                      onClick={() => {
                        const newMinutes = Math.max(0, customMinutes - 2);
                        setCustomMinutes(newMinutes);
                        updateTimeAndTimer(customHours, newMinutes, customSeconds);
                      }}
                      className="mt-2 w-8 h-6 bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-700 dark:text-green-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▼
                    </button>
                  </div>
                  
                  {/* Separator */}
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none self-center">:</div>
                  
                  {/* Seconds */}
                  <div className="text-center relative flex flex-col items-center">
                    {/* Up Arrow for Seconds */}
                    <button
                      onClick={() => {
                        const newSeconds = Math.min(59, customSeconds + 2);
                        setCustomSeconds(newSeconds);
                        updateTimeAndTimer(customHours, customMinutes, newSeconds);
                      }}
                      className="mb-2 w-8 h-6 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▲
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono leading-none mb-1">
                        {time.seconds}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 text-xs font-medium">SEC</div>
                    </div>
                    {/* Down Arrow for Seconds */}
                    <button
                      onClick={() => {
                        const newSeconds = Math.max(0, customSeconds - 2);
                        setCustomSeconds(newSeconds);
                        updateTimeAndTimer(customHours, customMinutes, newSeconds);
                      }}
                      className="mt-2 w-8 h-6 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      ▼
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Control Buttons - Right Side */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 shadow-md transition-all duration-200 transform hover:scale-105 min-w-[70px]"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-5 py-2 bg-amber-600 text-white text-sm font-bold rounded-full hover:bg-amber-700 shadow-md transition-all duration-200 transform hover:scale-105 min-w-[70px]"
            >
              Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-full hover:bg-purple-700 shadow-md transition-all duration-200 transform hover:scale-105 min-w-[70px]"
          >
            Reset
          </button>
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
