"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (!window.localStorage.getItem("locallead-theme-v2")) {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("locallead-theme-v2", "light");
    }
    const savedAccent = window.localStorage.getItem("locallead-accent");
    const savedForeground = window.localStorage.getItem("locallead-accent-foreground");
    if (savedAccent) document.documentElement.style.setProperty("--accent", savedAccent);
    if (savedForeground) document.documentElement.style.setProperty("--accent-foreground", savedForeground);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="locallead-theme-v2"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
