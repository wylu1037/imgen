"use client";

import * as React from "react";

import { DEFAULT_THEME, isValidTheme, type StyleTheme } from "@/lib/themes";

const STORAGE_KEY = "imgen-theme";

function applyTheme(theme: StyleTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<StyleTheme>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidTheme(stored)) return stored;
    return DEFAULT_THEME;
  });

  React.useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme: setThemeState };
}

export type { StyleTheme as Theme };
