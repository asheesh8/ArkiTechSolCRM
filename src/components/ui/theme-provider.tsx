"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const savedAccent = window.localStorage.getItem("locallead-accent");
    const savedForeground = window.localStorage.getItem("locallead-accent-foreground");
    if (savedAccent) document.documentElement.style.setProperty("--accent", savedAccent);
    if (savedForeground) document.documentElement.style.setProperty("--accent-foreground", savedForeground);
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
