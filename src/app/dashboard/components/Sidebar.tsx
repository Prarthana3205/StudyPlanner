"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface SidebarProps {
  user: { 
    name: string | undefined | null;
    profilePhoto?: string;
    occupation?: string;
  }; // Accepts undefined/null for SSR/async
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactElement;
  isImage?: boolean;
  imageSrc?: string;
}

// SVG Icons for better visibility
const DashboardIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const CalendarIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ProfileIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
  </svg>
);

const LogoutIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function Sidebar({
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  selectedMenu,
  setSelectedMenu,
}: SidebarProps) {
  const router = useRouter();
  const [profileHovered, setProfileHovered] = useState(false);

  // Use fallback if user.name is not available yet
  const displayName = user?.name || "";

  // Define menu items inside component to avoid stale closures
  const menuItems: MenuItem[] = [
    { label: "Dashboard", icon: <DashboardIcon size={20} /> },
    { label: "Profile", icon: <ProfileIcon size={20} /> },
    { label: "Calendar", icon: <CalendarIcon size={20} /> },
    { label: "StudyGenie", icon: <div />, isImage: true, imageSrc: "/genie1.png" },
    { label: "Settings", icon: <SettingsIcon size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      // Call the logout API to clear the token cookie
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        router.push("/login");
      } else {
        console.error('Logout failed');
        // Still redirect even if API call fails
        router.push("/login");
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push("/login");
    }
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
      <div 
        className="relative mb-10 mt-2 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:bg-purple-600/30 rounded-lg p-2"
        onMouseEnter={() => setProfileHovered(true)}
        onMouseLeave={() => setProfileHovered(false)}
      >
        <div className="flex items-center justify-center">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className={`rounded-full object-cover border-2 border-yellow-400 transition-all duration-300 ease-in-out ${
                profileHovered 
                  ? 'w-20 h-20 shadow-lg' 
                  : 'w-10 h-10 mr-3'
              }`}
              style={{
                position: profileHovered ? 'relative' : 'static',
                zIndex: profileHovered ? 10 : 1
              }}
            />
          ) : (
            <div 
              className={`bg-yellow-400 text-purple-900 rounded-full flex items-center justify-center font-bold transition-all duration-300 ease-in-out ${
                profileHovered 
                  ? 'w-20 h-20 text-3xl shadow-lg' 
                  : 'w-10 h-10 text-xl mr-3'
              }`}
              style={{
                position: profileHovered ? 'relative' : 'static',
                zIndex: profileHovered ? 10 : 1
              }}
            >
              {displayName ? displayName[0] : "?"}
            </div>
          )}
          {!sidebarCollapsed && (
            <div 
              className={`flex flex-col transition-all duration-300 ease-in-out ${
                profileHovered 
                  ? 'opacity-0 translate-x-6 pointer-events-none' 
                  : 'opacity-100 translate-x-0'
              }`}
              style={{
                position: profileHovered ? 'absolute' : 'static',
                left: profileHovered ? '100%' : 'auto'
              }}
            >
              <span className="font-bold text-lg truncate">
                {displayName ? `Hello, ${displayName}` : "Loading..."}
              </span>
              {user?.occupation && (user.occupation === "student" || user.occupation === "teacher") && (
                <span className="text-sm text-purple-200 truncate">
                  {user.occupation.charAt(0).toUpperCase() + user.occupation.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded hover:bg-purple-600 transition-colors w-full text-left ${
                  item.label === selectedMenu
                    ? "bg-purple-800 font-semibold"
                    : ""
                }`}
                onClick={() => setSelectedMenu(item.label)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.isImage ? (
                  <img 
                    src={item.imageSrc} 
                    alt={item.label} 
                    className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                  />
                ) : (
                  <div className="text-white flex items-center justify-center">
                    {(() => {
                      const iconSize = sidebarCollapsed ? 24 : 20;
                      switch (item.label) {
                        case "Dashboard": return <DashboardIcon size={iconSize} />;
                        case "Calendar": return <CalendarIcon size={iconSize} />;
                        case "Profile": return <ProfileIcon size={iconSize} />;
                        case "Settings": return <SettingsIcon size={iconSize} />;
                        default: return item.icon;
                      }
                    })()}
                  </div>
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
          className="flex items-center gap-3 w-full bg-yellow-400 text-purple-900 py-2 rounded hover:bg-yellow-300 justify-center transition-colors"
          onClick={handleLogout}
        >
          <LogoutIcon size={sidebarCollapsed ? 24 : 20} />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
