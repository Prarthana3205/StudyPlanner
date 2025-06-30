"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
  };

  const handleCalendarNoteChange = (
    day: number,
    month: number,
    year: number,
    entries: { title: string; description: string }[]
  ) => {
    setCalendarNotes((prev) => {
      const yearNotes = { ...(prev[year] || {}) };
      const monthNotes = { ...(yearNotes[month] || {}) };
      monthNotes[day] = { entries };
      yearNotes[month] = monthNotes;
      return { ...prev, [year]: yearNotes };
    });
    setSelectedDayInfo((info) =>
      info && info.day === day && info.month === month && info.year === year
        ? { ...info, entries }
        : info
    );
  };

  function AgendaView() {
    const [localEntries, setLocalEntries] = useState([{ title: "", description: "" }]);

    // Only update localEntries when the selected day changes, not when localEntries changes
    useEffect(() => {
      if (selectedDayInfo) {
        setLocalEntries(selectedDayInfo.entries && selectedDayInfo.entries.length > 0
          ? selectedDayInfo.entries
          : [{ title: "", description: "" }]
        );
      }
      // Only run when the selected day changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDayInfo?.day, selectedDayInfo?.month, selectedDayInfo?.year]);

    if (!selectedDayInfo || !selectedDayInfo.day) return null;

    // Only update parent state in useEffect, not in render or setState callback
    const handleEntryChange = (idx: number, field: "title" | "description", value: string) => {
      setLocalEntries((prev) => {
        const updated = prev.map((entry, i) =>
          i === idx ? { ...entry, [field]: value } : entry
        );
        return updated;
      });
    };

    const handleAddEntry = () => {
      setLocalEntries((prev) => [...prev, { title: "", description: "" }]);
    };

    const handleDeleteEntry = (idx: number) => {
      setLocalEntries((prev) => {
        const updated = prev.filter((_, i) => i !== idx);
        // Immediately update parent state so calendar reflects deletion
        if (selectedDayInfo && selectedDayInfo.day) {
          handleCalendarNoteChange(
            selectedDayInfo.day,
            selectedDayInfo.month,
            selectedDayInfo.year,
            updated.length > 0 ? updated : [{ title: "", description: "" }]
          );
        }
        return updated.length > 0 ? updated : [{ title: "", description: "" }];
      });
    };

  const handleSave = () => {
    if (!selectedDayInfo || !selectedDayInfo.day) return;
    handleCalendarNoteChange(
      selectedDayInfo.day,
      selectedDayInfo.month,
      selectedDayInfo.year,
      localEntries
    );
  };


    return (
      <div className="w-full md:w-96 bg-white/90 rounded-2xl shadow-xl p-6 ml-0 md:ml-8 mt-8 md:mt-0 h-[calc(100vh-5rem)] flex flex-col">
        <h2 className="text-xl font-bold text-purple-800 mb-2">
          Agenda for {selectedDayInfo.day} {monthNames[selectedDayInfo.month]} {selectedDayInfo.year}
        </h2>
        <div className="flex-1" style={{ minHeight: 0, overflowY: "auto" }}>
          {localEntries.map((entry, idx) => (
            <div key={idx} className="mb-4 relative">
              <input
                className="w-full border rounded p-2 mb-2 focus:outline-none focus:border-purple-400 font-semibold text-black"
                value={entry.title}
                onChange={e => handleEntryChange(idx, "title", e.target.value)}
                placeholder={`Title${localEntries.length > 1 ? ` ${idx + 1}` : ""}`}
              />
              <textarea
                className="w-full border rounded p-2 min-h-[60px] focus:outline-none focus:border-purple-400 text-black"
                value={entry.description}
                onChange={e => handleEntryChange(idx, "description", e.target.value)}
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
          ))}
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
    // Example: fetch user from API endpoint `/api/me` that returns { name: "..." }
    // Replace this with your actual user fetching logic
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

  useEffect(() => {
    // Example: Fetch user from localStorage (replace with your actual logic)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Optionally clear auth state here
    router.push("/login");
  };

  // Pass setSelectedMenu to Sidebar so it can update the selection
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
      />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex-1 ml-0 transition-all duration-300 p-10 flex ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Sidebar open button for mobile */}
        {!sidebarOpen && (
          <button
            className="m-4 p-2 rounded bg-purple-700 text-black md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            &#9776;
          </button>
        )}
        {selectedMenu === "Dashboard" && <DashboardContent />}
        {selectedMenu === "Calendar" && (
          <div className="flex flex-col md:flex-row w-full">
            <div className="flex-1">
              <CalendarWidget
                notes={calendarNotes}
                setNotes={setCalendarNotes}
                onDaySelect={handleCalendarDaySelect}
              />
            </div>
            <div className="w-full md:w-96">
              <AgendaView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


