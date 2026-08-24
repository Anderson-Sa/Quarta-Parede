"use client";

import { useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const STORAGE_KEY = "admin-theme";

/** Mirrors the anti-flash inline script in src/app/admin/layout.tsx: keeps
 * the data-admin-theme attribute on <html> (scoped to .admin-shell by CSS,
 * see globals.css) in sync with the chosen theme. */
function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-admin-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-admin-theme");
  }
}

/** Sun/moon button that toggles the admin panel between dark and light mode.
 * Choice is remembered per-browser via localStorage; the public blog is
 * unaffected. */
export function ThemeToggle() {
  // Lazy initializer: reads the stored preference once, on mount, matching
  // what the anti-flash script in admin/layout.tsx already applied to
  // <html>. Server-rendered markup always starts from "dark" (no
  // localStorage there), so the very first client render can briefly
  // mismatch — suppressed below since the corrected icon is the source of
  // truth for a client-only preference.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  });

  // Dev-only fix: React's Strict Mode remounts the tree once and, on that
  // remount, resets <html> to only the attributes it manages from JSX —
  // clearing the data-admin-theme attribute the anti-flash script (in
  // src/app/layout.tsx) set during initial parsing. Re-applying it here is a
  // no-op in production, where this remount doesn't happen.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex items-center gap-1.5 text-foreground/60 hover:text-brand"
      suppressHydrationWarning
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
