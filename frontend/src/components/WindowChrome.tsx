"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { domainDisplayName } from "@/lib/genlayerClient";
import { useNavPane } from "@/lib/NavPaneProvider";
import WalletConnectButton from "./WalletConnectButton";
import NetworkSwitcher from "./NetworkSwitcher";
import {
  AppIconMark,
  BackIcon,
  ChevronRightIcon,
  ForwardIcon,
  MenuIcon,
  RefreshIcon,
  ThisPcIcon,
  UpIcon,
  WindowDots,
} from "./icons";

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return [{ label: "Precedent Engine" }];
  if (parts[0] === "dashboard") return [{ label: "Precedent Engine", href: "/" }, { label: "Case Files" }];
  if (parts[0] === "submit")
    return [{ label: "Precedent Engine", href: "/" }, { label: "Case Files", href: "/dashboard" }, { label: "New Case" }];
  if (parts[0] === "docs") return [{ label: "Precedent Engine", href: "/" }, { label: "Help" }];
  if (parts[0] === "recent") return [{ label: "Precedent Engine", href: "/" }, { label: "Recent Cases" }];
  if (parts[0] === "about") return [{ label: "Precedent Engine", href: "/" }, { label: "About" }];
  if (parts[0] === "profile") return [{ label: "Precedent Engine", href: "/" }, { label: "User Profile" }];
  if (parts[0] === "history") return [{ label: "Precedent Engine", href: "/" }, { label: "History" }];
  if (parts[0] === "explorer" && parts[1]) {
    return [
      { label: "Precedent Engine", href: "/" },
      { label: "Case Files", href: "/dashboard" },
      { label: domainDisplayName(decodeURIComponent(parts[1])) },
    ];
  }
  if (parts[0] === "case" && parts[1]) {
    return [
      { label: "Precedent Engine", href: "/" },
      { label: "Case Files", href: "/dashboard" },
      { label: `Case #${decodeURIComponent(parts[1])}.ruling` },
    ];
  }
  if (parts[0] === "appeal" && parts[1]) {
    return [
      { label: "Precedent Engine", href: "/" },
      { label: "Case Files", href: "/dashboard" },
      { label: `Case #${decodeURIComponent(parts[1])}`, href: `/case/${parts[1]}` },
      { label: "Appeal" },
    ];
  }
  return [{ label: "Precedent Engine", href: "/" }];
}

export default function WindowChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);
  const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2] : undefined;
  const { toggleMobile } = useNavPane();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-chrome-border bg-chrome-titlebar px-4 py-2">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Toggle navigation"
          className="toolbar-btn !px-1.5 sm:hidden"
        >
          <MenuIcon />
        </button>
        <WindowDots />
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <span className="h-4 w-4">
            <AppIconMark />
          </span>
          <span className="text-xs font-semibold text-ink-muted">Precedent Engine</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-chrome-border bg-chrome-toolbar px-3 py-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="toolbar-btn !px-1.5"
          >
            <BackIcon />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            aria-label="Forward"
            className="toolbar-btn !px-1.5"
          >
            <ForwardIcon />
          </button>
          <button
            type="button"
            onClick={() => router.push(parent?.href ?? "/dashboard")}
            aria-label="Up one level"
            className="toolbar-btn !px-1.5"
          >
            <UpIcon />
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            aria-label="Refresh"
            className="toolbar-btn !px-1.5"
          >
            <RefreshIcon />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm border border-chrome-border bg-white px-3 py-1.5 text-xs">
          <ThisPcIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
          {crumbs.map((c, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRightIcon className="h-3 w-3 shrink-0 text-ink-faint" />}
              {c.href ? (
                <Link href={c.href} className="truncate text-ink-muted hover:text-accent-600 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/submit" className="toolbar-btn border border-transparent hover:border-chrome-border">
            + New Case
          </Link>
          <Link href="/docs" className="toolbar-btn border border-transparent hover:border-chrome-border">
            Help
          </Link>
          <NetworkSwitcher />
          <div className="ml-1 scale-90">
            <WalletConnectButton />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col sm:flex-row">{children}</div>
    </div>
  );
}
