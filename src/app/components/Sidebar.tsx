"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  user: { name: string | undefined | null }; // Accepts undefined/null for SSR/async
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
}

interface MenuItem {
  label: string;
  icon: string;
  isImage?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Projects", icon: "📁" },
  { label: "Calendar", icon: "🗓️" },
  { label: "StudyGenie", icon: "/genie.png", isImage: true },
  { label: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  selectedMenu,
  setSelectedMenu,
}: SidebarProps) {
  const router = useRouter();

  // Use fallback if user.name is not available yet
  const displayName = user?.name || "";

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div
      className={`bg-purple-700 text-white ${
        sidebarCollapsed ? "w-20" : "w-64"
      } h-screen fixed left-0 top-0 bottom-0 p-6 transition-all duration-300 flex flex-col z-20`}
    >
      {/* Collapse/Expand Button */}
      <button
        className={`absolute top-1/2 right-[-16px] -translate-y-1/2 bg-purple-700 border-2 border-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-transform duration-300 z-30 ${
          sidebarCollapsed ? "rotate-180" : ""
        }`}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="text-lg">{sidebarCollapsed ? "→" : "←"}</span>
      </button>

      {/* User Info */}
      <div className="flex items-center mb-10 mt-2">
        <div className="bg-yellow-400 text-purple-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-3">
          {displayName ? displayName[0] : "?"}
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-lg truncate">
            {displayName ? `Hello, ${displayName}` : "Loading..."}
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-purple-600 transition-colors w-full text-left ${
                  item.label === selectedMenu
                    ? "bg-purple-800 font-semibold"
                    : ""
                }`}
                onClick={() => setSelectedMenu(item.label)}
              >
                {item.isImage ? (
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="w-5 h-5" 
                  />
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          className="flex items-center gap-3 w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-300 justify-center"
          onClick={handleLogout}
        >
          <span className="text-xl">🚪</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
