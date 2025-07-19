"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo ,useRef,useCallback} from "react";
import Sidebar from "./components/Sidebar";
import CalendarWidget from "./components/CalendarWidget";
import TodoWidget from "./components/TodoWidget";
import StudyGenie from "./components/StudyGenie";
import PomodoroTimer from "./components/PomodoroTimer";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Example dashboard content component
function DashboardContent() {
  const [todoStats, setTodoStats] = useState({ total: 0, completed: 0 });
  const [calendarStats, setCalendarStats] = useState({ events: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic greeting and motivational messages
  const getGreetingAndMessage = () => {
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) {
      greeting = "Good Morning";
    } else if (hour < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }

    const motivationalMessages = [
      "Study Smart, Score Big! 🚀",
      "Learn Faster, Retain Longer! 🧠",
      "Your Shortcut to Acing Exams! 📚",
      "Transform Knowledge into Success! ⭐",
      "Every Study Session Counts! 💪",
      "Focus Now, Celebrate Later! 🎉",
      "Turn Goals into Grades! 🎯",
      "Study Hard, Dream Big! ✨"
    ];

    // Generate a consistent random index based on the day (so it changes daily)
    const today = new Date().toDateString();
    const messageIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % motivationalMessages.length;
    
    return {
      greeting,
      message: motivationalMessages[messageIndex]
    };
  };

  const { greeting, message } = getGreetingAndMessage();

  const fetchTodoStats = async () => {
    try {
      const response = await fetch("/api/todos", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        const todos = data.todos || [];
        setTodoStats({
          total: todos.length,
          completed: todos.filter((t: any) => t.completed).length,
        });
      }
    } catch (error) {
      console.error("Error fetching todo stats:", error);
    }
  };

  useEffect(() => {
    fetchTodoStats();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Centered Greeting Section with Time */}
      <div className="relative flex items-center justify-center">
        {/* Time Display on the Left */}
        <div className="absolute left-0 flex flex-col items-start">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        </div>
        
        {/* Centered Greeting */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-4">
            {greeting}! 👋
          </h1>
          <p className="text-purple-700 dark:text-purple-300 text-lg font-medium">
            {message}
          </p>
        </div>
      </div>
      
      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Todo Widget */}
        <div className="lg:col-span-1">
          <TodoWidget onStatsUpdate={fetchTodoStats} />
        </div>
        
        {/* Right Column with Progress Bar and Pomodoro Timer */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Bar Widget */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl p-6 border-2 border-purple-300 dark:border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                📈 Progress
              </h2>
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {todoStats.completed}/{todoStats.total} tasks
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-900 dark:text-purple-100 font-medium">Completion Rate</span>
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {todoStats.total > 0 ? Math.round((todoStats.completed / todoStats.total) * 100) : 0}%
                </span>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ 
                    width: `${todoStats.total > 0 ? Math.round((todoStats.completed / todoStats.total) * 100) : 0}%` 
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          {/* Pomodoro Timer */}
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}

const menuItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "Todos", icon: "✅", href: "#" },
  { label: "Calendar", icon: "🗓️", href: "#" },
  { label: "Projects", icon: "📁", href: "#" },
  { label: "Settings", icon: "⚙️", href: "#" },
];

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string | null }>({ name: null });
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    day: number | null;
    month: number;
    year: number;
    entries: { title: string; description: string }[];
  } | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") || "light"; // Default to light mode
    if (saved === "light" || saved === "dark" || saved === "system") {
      setTheme(saved);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Save to localStorage
    localStorage.setItem("theme-mode", theme);
    
    // Dispatch custom event to notify ThemeManager
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: theme }));
  }, [theme]);

  // notes: { [year]: { [month]: { [day]: { entries: {title, description}[] } } } }
  const [calendarNotes, setCalendarNotes] = useState<{
    [year: number]: { [month: number]: { [day: number]: { entries: { title: string; description: string }[] } } };
  }>({});

  const getDayNote = (year: number, month: number, day: number) =>
    (calendarNotes[year] &&
      calendarNotes[year][month] &&
      calendarNotes[year][month][day]) || { entries: [{ title: "", description: "" }] };

  const handleCalendarDaySelect = (day: number, month: number, year: number) => {
    const note = getDayNote(year, month, day);
    setSelectedDayInfo({
      day,
      month,
      year,
      entries: note.entries && note.entries.length > 0 ? note.entries : [{ title: "", description: "" }],
    });
    setAgendaOpen(true);
  };

  const handleCalendarNoteChange = (
    day: number,
    month: number,
    year: number,
    entries: { title: string; description: string }[]
  ) => {
    console.log('Updating calendar notes for:', { day, month, year, entries });
    
    // Validate entries array
    if (!Array.isArray(entries)) {
      console.error('Invalid entries provided to handleCalendarNoteChange:', entries);
      return;
    }
    
    // Filter valid entries before updating state
    const validEntries = entries.filter(entry => 
      entry && 
      typeof entry === 'object' && 
      typeof entry.title === 'string' && 
      typeof entry.description === 'string'
    );
    
    setCalendarNotes((prev) => {
      const yearNotes = { ...(prev[year] || {}) };
      const monthNotes = { ...(yearNotes[month] || {}) };
      monthNotes[day] = { entries: validEntries };
      yearNotes[month] = monthNotes;
      const newState = { ...prev, [year]: yearNotes };
      console.log('New calendar notes state:', newState);
      return newState;
    });
    
    setSelectedDayInfo((info) =>
      info && info.day === day && info.month === month && info.year === year
        ? { ...info, entries: validEntries }
        : info
    );
    
    // Save to backend with validation
    if (validEntries.length > 0 || entries.length === 0) {
      saveDayNotes(day, month, year, validEntries);
    }
  };

  // Save notes to backend when changed
  const saveDayNotes = async (
    day: number,
    month: number,
    year: number,
    entries: { title: string; description: string }[]
  ) => {
    try {
      console.log('Saving to backend:', { day, month, year, entries });
      
      // Validate entries before filtering
      const validEntries = Array.isArray(entries) 
        ? entries.filter(entry => 
            entry && 
            typeof entry === 'object' && 
            (
              (typeof entry.title === 'string' && entry.title.trim()) || 
              (typeof entry.description === 'string' && entry.description.trim())
            )
          )
        : [];
      
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // ✅ this is mandatory for cookies
        body: JSON.stringify({
          date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          entries: validEntries,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save calendar notes:', response.status, response.statusText, errorText);
      } else {
        const result = await response.json();
        console.log('Successfully saved calendar notes:', result);
      }
    } catch (error) {
      console.error('Error saving calendar notes:', error);
      // Don't re-throw the error to prevent UI crashes
    }
  };

 function AgendaView() {
  const [localEntries, setLocalEntries] = useState([{ title: "", description: "" }]);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const lastSavedEntries = useRef<string>("");

  // Initialize localEntries only once when selectedDayInfo changes
  useEffect(() => {
    if (selectedDayInfo && selectedDayInfo.day) {
      const entries = selectedDayInfo.entries && selectedDayInfo.entries.length > 0
        ? selectedDayInfo.entries
        : [{ title: "", description: "" }];
      
      // Only update if entries have actually changed
      const entriesString = JSON.stringify(entries);
      if (!isInitialized.current || lastSavedEntries.current !== entriesString) {
        console.log('Initializing local entries:', entries);
        setLocalEntries(entries);
        lastSavedEntries.current = entriesString;
        isInitialized.current = true;
      }
    } else {
      isInitialized.current = false;
    }
  }, [selectedDayInfo?.day, selectedDayInfo?.month, selectedDayInfo?.year]);

  // Memoized save function to prevent unnecessary re-creates
  const debouncedSave = useCallback((entries: any[]) => {
    if (!selectedDayInfo?.day || !agendaOpen) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      if (agendaOpen && selectedDayInfo?.day) {
        const entriesString = JSON.stringify(entries);
        // Only save if entries have actually changed
        if (lastSavedEntries.current !== entriesString) {
          console.log('Debounced save triggered for entries:', entries);
          handleCalendarNoteChange(
            selectedDayInfo.day,
            selectedDayInfo.month,
            selectedDayInfo.year,
            entries
          );
          lastSavedEntries.current = entriesString;
        }
      }
    }, 1000);
  }, [selectedDayInfo?.day, selectedDayInfo?.month, selectedDayInfo?.year, agendaOpen]);

  // Debounced save effect
  useEffect(() => {
    if (isInitialized.current) {
      debouncedSave(localEntries);
    }

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [localEntries, debouncedSave]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleEntryChange = useCallback((idx: number, field: "title" | "description", value: string) => {
    console.log(`Changing entry ${idx} ${field} to:`, value);
    setLocalEntries((prev) => {
      if (!Array.isArray(prev) || idx < 0 || idx >= prev.length) {
        console.error('Invalid state or index for entry change');
        return prev;
      }
      
      const updated = prev.map((entry, i) => {
        if (i === idx) {
          const currentEntry = entry && typeof entry === 'object' ? entry : { title: "", description: "" };
          return { 
            ...currentEntry, 
            [field]: typeof value === 'string' ? value : "" 
          };
        }
        return entry && typeof entry === 'object' ? entry : { title: "", description: "" };
      });
      
      return updated;
    });
  }, []);

  const handleAddEntry = useCallback(() => {
    setLocalEntries((prev) => {
      const validPrev = Array.isArray(prev) ? prev : [{ title: "", description: "" }];
      return [...validPrev, { title: "", description: "" }];
    });
  }, []);

  const handleDeleteEntry = useCallback((idx: number) => {
    setLocalEntries((prev) => {
      if (!Array.isArray(prev)) {
        console.error('localEntries is not an array for deletion:', prev);
        return [{ title: "", description: "" }];
      }
      
      const updated = prev.filter((_, i) => i !== idx);
      const finalEntries = updated.length > 0 ? updated : [{ title: "", description: "" }];
      
      return finalEntries;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedDayInfo || !selectedDayInfo.day) return;
    console.log('Manual save triggered');
    
    // Cancel any pending debounced save
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    handleCalendarNoteChange(
      selectedDayInfo.day,
      selectedDayInfo.month,
      selectedDayInfo.year,
      localEntries
    );
    lastSavedEntries.current = JSON.stringify(localEntries);
  }, [selectedDayInfo, localEntries]);

  const handleClose = useCallback(() => {
    // Force save before closing
    if (selectedDayInfo?.day) {
      handleCalendarNoteChange(
        selectedDayInfo.day,
        selectedDayInfo.month,
        selectedDayInfo.year,
        localEntries
      );
    }
    isInitialized.current = false;
    setAgendaOpen(false);
  }, [selectedDayInfo, localEntries]);

  if (!selectedDayInfo || !selectedDayInfo.day || !agendaOpen) return null;

  return (
    <div className="w-full md:w-96 bg-white/90 dark:bg-gray-800/90 text-black dark:text-white rounded-2xl shadow-xl p-6 ml-0 md:ml-8 mt-8 md:mt-0 h-[calc(100vh-5rem)] flex flex-col relative border border-theme">
      <button
        className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-black dark:hover:text-white font-bold bg-transparent"
        onClick={handleClose}
        title="Close agenda"
        type="button"
        style={{ lineHeight: "1" }}
      >
        ×
      </button>
      <h2 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-2">
        Agenda for {selectedDayInfo.day} {monthNames[selectedDayInfo.month]} {selectedDayInfo.year}
      </h2>
      <div className="flex-1" style={{ minHeight: 0, overflowY: "auto" }}>
        {Array.isArray(localEntries) && localEntries.map((entry, idx) => {
          const safeEntry = entry && typeof entry === 'object' ? entry : { title: "", description: "" };
          
          return (
            <div
              key={`entry-${idx}-${selectedDayInfo.day}-${selectedDayInfo.month}-${selectedDayInfo.year}`}
              className={`mb-4 relative animate-fade-in`}
            >
              <input
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded p-2 mb-2 focus:outline-none focus:border-purple-400 font-semibold"
                value={safeEntry.title || ""}
                onChange={e => handleEntryChange(idx, "title", e.target.value)}
                placeholder={`Title${localEntries.length > 1 ? ` ${idx + 1}` : ""}`}
              />
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded p-2 resize-none overflow-hidden focus:outline-none focus:border-purple-400"
                style={{ minHeight: "60px", transition: "height 0.2s ease" }}
                value={safeEntry.description || ""}
                onChange={(e) => {
                  handleEntryChange(idx, "description", e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                placeholder={`Description${localEntries.length > 1 ? ` ${idx + 1}` : ""}`}
              />
              {localEntries.length > 1 && (
                <button
                  className="absolute top-0 right-0 mt-1 mr-1 px-2 py-1 rounded text-gray-400 hover:text-black dark:hover:text-white text-lg font-bold bg-transparent"
                  onClick={() => handleDeleteEntry(idx)}
                  title="Delete entry"
                  type="button"
                  style={{ lineHeight: "1" }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button
          className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-800"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="px-4 py-2 rounded bg-yellow-400 text-white font-bold hover:bg-yellow-500 flex items-center justify-center"
          onClick={handleAddEntry}
          title="Add another entry"
          type="button"
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include", 
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        console.error("Failed to fetch user:", res.status);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  fetchUser();
}, []);

  // Fetch notes from backend on mount
  useEffect(() => {
    async function fetchNotes() {
      try {
        console.log('Fetching calendar notes from backend...');
        const res = await fetch("/api/calendar", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          console.log('Received calendar data from backend:', data);
          
          const notes: typeof calendarNotes = {};
          (data.events || []).forEach((ev: any) => {
            console.log('Processing event:', ev);
            const [year, month, day] = ev.date.split("-").map(Number);
            if (!notes[year]) notes[year] = {};
            if (!notes[year][month - 1]) notes[year][month - 1] = {};
            
            if (!notes[year][month - 1][day]) {
              notes[year][month - 1][day] = { entries: [] };
            }
            
            // Handle both batch entries and single entries
            if (Array.isArray(ev.entries) && ev.entries.length > 0) {
              notes[year][month - 1][day].entries = ev.entries;
            } else if (ev.title || ev.details) {
              notes[year][month - 1][day].entries.push({
                title: ev.title || "",
                description: ev.details || "",
              });
            }
          });
          
          console.log('Processed calendar notes:', notes);
          setCalendarNotes(notes);
        } else {
          console.error('Failed to fetch calendar notes:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Error fetching calendar notes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, [router]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50 dark:from-gray-900 dark:to-gray-800 items-center justify-center">
        <div className="text-purple-800 dark:text-purple-300 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50 dark:from-gray-900 dark:to-gray-800">{/* Updated to use original gradient for light mode and dark gradient for dark mode */}
      <Sidebar
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ml-0 transition-all duration-300 p-0 flex ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {!sidebarOpen && (
          <button
            className="m-4 p-2 rounded bg-purple-700 text-theme md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            &#9776;
          </button>
        )}
        {selectedMenu === "Dashboard" && (
          <div className="w-full p-10">
            <DashboardContent />
          </div>
        )}
        {selectedMenu === "Todos" && (
          <div className="w-full p-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-4">
                  My Todo List
                </h1>
                <p className="text-purple-700 dark:text-purple-300">
                  Manage your tasks and stay productive.
                </p>
              </div>
              <TodoWidget />
            </div>
          </div>
        )}
        {selectedMenu === "Calendar" && (
          <div className="flex w-full h-[calc(100vh-0rem)]">
            <div className={`transition-all duration-300 ${agendaOpen ? "md:w-2/3 w-full" : "w-full"}`}>
              <div className="p-8">
                <CalendarWidget
                  notes={calendarNotes}
                  setNotes={setCalendarNotes}
                  onDaySelect={handleCalendarDaySelect}
                />
              </div>
            </div>
            {agendaOpen && (
              <div
                className="transition-all duration-300 h-full flex items-start"
                style={{
                  minWidth: "320px",
                  maxWidth: "400px",
                  marginTop: "2.5rem"
                }}
              >
                <AgendaView />
              </div>
            )}
          </div>
        )}
        {selectedMenu === "StudyGenie" && (
          <StudyGenie />
        )}
        {selectedMenu === "Settings" && (
          <div className="w-full p-10">
            <style jsx>{`
              .fade-in-settings {
                animation: fadeInSettings 0.6s cubic-bezier(0.4,0,0.2,1);
              }
              @keyframes fadeInSettings {
                from { opacity: 0; transform: translateY(16px);}
                to { opacity: 1; transform: translateY(0);}
              }
              .theme-selector {
                animation: fadeInSettings 0.4s;
              }
            `}</style>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-6">Settings</h2>
            <ul className="space-y-4 fade-in-settings">
              <li
                className="p-4 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 cursor-pointer font-semibold text-purple-800 dark:text-purple-200 shadow border border-theme"
                onClick={() => setShowAppearance((v) => !v)}
              >
                Appearance Settings
                {showAppearance && (
                  <div className="theme-selector mt-4 ml-2 flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-purple-800 dark:text-purple-300">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}
                        className="accent-purple-600"
                      />
                      <span>☀️ Light</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-purple-800 dark:text-purple-300">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={() => setTheme("dark")}
                        className="accent-purple-600"
                      />
                      <span>🌙 Dark</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-purple-800 dark:text-purple-300">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={theme === "system"}
                        onChange={() => setTheme("system")}
                        className="accent-purple-600"
                      />
                      <span>💻 System Default</span>
                    </label>
                  </div>
                )}
              </li>
              <li className="p-4 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 cursor-pointer font-semibold text-purple-800 dark:text-purple-200 shadow border border-theme">
                Reminder Settings
              </li>
              <li className="p-4 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 cursor-pointer font-semibold text-purple-800 dark:text-purple-200 shadow border border-theme">
                Notifications
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
 }
