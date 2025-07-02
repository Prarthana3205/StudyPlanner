"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  _id?: string;
  date: string;
  title: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [form, setForm] = useState({ date: "", title: "" });
  const [loading, setLoading] = useState(false);

  // Fetch events on mount and after adding
  const fetchEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/calendar", { credentials: "include" });
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.title) return;
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setForm({ date: "", title: "" });
    fetchEvents();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <form onSubmit={addEvent} className="flex gap-2 mb-6">
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Event Title"
          required
          className="border rounded px-2 py-1 flex-1"
        />
        <button type="submit" className="bg-purple-700 text-white px-4 py-1 rounded">
          Add
        </button>
      </form>
      {loading ? (
        <div>Loading events...</div>
      ) : (
        <ul className="space-y-2">
          {events.length === 0 && <li className="text-gray-400">No events yet.</li>}
          {events.map(ev => (
            <li key={ev._id || ev.date + ev.title} className="flex items-center gap-4">
              <span className="font-mono">{ev.date}</span>
              <span>{ev.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
