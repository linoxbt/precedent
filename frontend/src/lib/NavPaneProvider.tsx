"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface NavPaneContextValue {
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const NavPaneContext = createContext<NavPaneContextValue | undefined>(undefined);

export function NavPaneProvider({ children }: { children: ReactNode }) {
  // Visible by default: the nav pane renders inline on mobile just like it
  // does on desktop, not hidden behind a drawer the user has to discover.
  // The hamburger button toggles it away for those who want the space back.
  const [mobileOpen, setMobileOpen] = useState(true);

  const value = useMemo(
    () => ({
      mobileOpen,
      toggleMobile: () => setMobileOpen((v) => !v),
      closeMobile: () => setMobileOpen(false),
    }),
    [mobileOpen]
  );

  return <NavPaneContext.Provider value={value}>{children}</NavPaneContext.Provider>;
}

export function useNavPane(): NavPaneContextValue {
  const ctx = useContext(NavPaneContext);
  if (!ctx) throw new Error("useNavPane must be used within NavPaneProvider");
  return ctx;
}
