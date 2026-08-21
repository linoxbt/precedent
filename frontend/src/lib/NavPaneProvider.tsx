"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface NavPaneContextValue {
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const NavPaneContext = createContext<NavPaneContextValue | undefined>(undefined);

export function NavPaneProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation so it doesn't stay open after picking a link.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
