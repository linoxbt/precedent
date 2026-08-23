"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface NavPaneContextValue {
  /** Whether the nav pane is visible at all, on both mobile and desktop. */
  paneOpen: boolean;
  togglePane: () => void;
  closePane: () => void;
}

const NavPaneContext = createContext<NavPaneContextValue | undefined>(undefined);

export function NavPaneProvider({ children }: { children: ReactNode }) {
  // Visible by default: the nav pane renders inline on mobile just like it
  // does on desktop, not hidden behind a drawer the user has to discover.
  // The same toggle button (in the title bar) collapses it away on either
  // breakpoint for those who want the space back.
  const [paneOpen, setPaneOpen] = useState(true);

  const value = useMemo(
    () => ({
      paneOpen,
      togglePane: () => setPaneOpen((v) => !v),
      closePane: () => setPaneOpen(false),
    }),
    [paneOpen]
  );

  return <NavPaneContext.Provider value={value}>{children}</NavPaneContext.Provider>;
}

export function useNavPane(): NavPaneContextValue {
  const ctx = useContext(NavPaneContext);
  if (!ctx) throw new Error("useNavPane must be used within NavPaneProvider");
  return ctx;
}
