"use client";
import { useEffect, useState } from "react";

export default function ThemeManager() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Function to apply theme
  const applyTheme = (themeMode: "light" | "dark" | "system") => {
    let appliedTheme = themeMode;
    if (themeMode === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // Remove existing theme classes
    document.body.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.remove("dark");
    
    // Add new theme classes
    document.body.classList.add(`theme-${appliedTheme}`);
    
    // Add dark class to html for Tailwind dark mode
    if (appliedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  };

  // Initial theme load
  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") || "light"; // Default to light mode
    if (saved === "light" || saved === "dark" || saved === "system") {
      setTheme(saved);
      applyTheme(saved);
    } else {
      // If no saved theme, apply light mode immediately
      applyTheme("light");
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme-mode" && e.newValue) {
        const newTheme = e.newValue as "light" | "dark" | "system";
        if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
          setTheme(newTheme);
          applyTheme(newTheme);
        }
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    // Custom event listener for same-tab localStorage changes
    const handleCustomThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail as "light" | "dark" | "system";
      if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener("themeChanged" as any, handleCustomThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChanged" as any, handleCustomThemeChange);
    };
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => {
        applyTheme("system");
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [theme]);

  return null;
}
