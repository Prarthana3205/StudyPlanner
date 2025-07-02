"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo ,useRef,useCallback} from "react";
import Sidebar from "../components/Sidebar";
import CalendarWidget from "./CalendarWidget";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Example dashboard content component
function DashboardContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-purple-900 mb-6">
        Welcome to your Dashboard
      </h1>
      {/* ...add your dashboard widgets, stats, to-do, etc. here... */}
      <p className="text-purple-700">
        This is your main dashboard area. Add your widgets and content here.
      </p>
    </div>
  );
}

const menuItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "Projects", icon: "📁", href: "#" },
  { label: "Calendar", icon: "🗓️", href: "#" },
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
        credentials: "include",
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
    <div className="w-full md:w-96 bg-white/90 rounded-2xl shadow-xl p-6 ml-0 md:ml-8 mt-8 md:mt-0 h-[calc(100vh-5rem)] flex flex-col relative">
      <button
        className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-black font-bold bg-transparent"
        onClick={handleClose}
        title="Close agenda"
        type="button"
        style={{ lineHeight: "1" }}
      >
        ×
      </button>
      <h2 className="text-xl font-bold text-purple-800 mb-2">
        Agenda for {selectedDayInfo.day} {monthNames[selectedDayInfo.month]} {selectedDayInfo.year}
      </h2>
      <div className="flex-1" style={{ minHeight: 0, overflowY: "auto" }}>
        {Array.isArray(localEntries) && localEntries.map((entry, idx) => {
          const safeEntry = entry && typeof entry === 'object' ? entry : { title: "", description: "" };
          
          return (
            <div
              key={`entry-${idx}-${selectedDayInfo.day}-${selectedDayInfo.month}-${selectedDayInfo.year}`}
              className={`mb-4 relative animate-fade-in`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <input
                className="w-full border rounded p-2 mb-2 focus:outline-none focus:border-purple-400 font-semibold text-black"
                value={safeEntry.title || ""}
                onChange={e => handleEntryChange(idx, "title", e.target.value)}
                placeholder={`Title${localEntries.length > 1 ? ` ${idx + 1}` : ""}`}
              />
              <textarea
                className="w-full border rounded p-2 resize-none overflow-hidden focus:outline-none focus:border-purple-400 text-black"
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
                  className="absolute top-0 right-0 mt-1 mr-1 px-2 py-1 rounded text-gray-400 hover:text-black text-lg font-bold bg-transparent"
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
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s both;
        }
      `}</style>
    </div>
  );
}

  useEffect(() => {
    // Fetch user from API endpoint `/api/me`
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name:
              typeof data.name === "string" && data.name.trim()
                ? data.name
                : null,
          });
        } else {
          setUser({ name: null });
        }
      } catch {
        setUser({ name: null });
      }
    }
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
      <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50 items-center justify-center">
        <div className="text-purple-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50">
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
            className="m-4 p-2 rounded bg-purple-700 text-black md:hidden"
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
      </div>
    </div>
  );
}