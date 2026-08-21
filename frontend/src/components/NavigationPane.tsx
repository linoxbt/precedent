"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { domainDisplayName, listDomains, registerDomain } from "@/lib/genlayerClient";
import { isContractConfigured } from "@/lib/genlayerConfig";
import { useActiveNetwork } from "@/lib/NetworkProvider";
import { useNavPane } from "@/lib/NavPaneProvider";
import { getConnectedProviderAndAccount } from "@/lib/walletProvider";
import {
  ChevronDownIcon,
  FolderIcon,
  HelpIcon,
  HistoryIcon,
  InfoIcon,
  NewFileIcon,
  RecentIcon,
  ThisPcIcon,
  UserIcon,
} from "./icons";
import type { DomainConfig } from "@/lib/types";

const WIDTH_KEY = "navPaneWidth";
const COLLAPSE_KEY = "navPaneCollapsed";
const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 240;
const LONG_PRESS_MS = 500;

export default function NavigationPane() {
  const pathname = usePathname();
  const { network } = useActiveNetwork();
  const { isConnected } = useAccount();
  const { mobileOpen } = useNavPane();

  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderRubric, setNewFolderRubric] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadDomains() {
    if (!isContractConfigured(network)) {
      setDomains([]);
      return;
    }
    listDomains(network)
      .then(setDomains)
      .catch(() => setDomains([]));
  }

  useEffect(() => {
    loadDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  useEffect(() => {
    const savedWidth = Number(localStorage.getItem(WIDTH_KEY));
    if (savedWidth >= MIN_WIDTH && savedWidth <= MAX_WIDTH) setWidth(savedWidth);
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    setWidth((_w) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      localStorage.setItem(WIDTH_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!resizing) return;
    function stop() {
      setResizing(false);
    }
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [resizing, handleResizeMove]);

  useEffect(() => {
    if (!contextMenu) return;
    function dismiss() {
      setContextMenu(null);
    }
    window.addEventListener("click", dismiss);
    return () => window.removeEventListener("click", dismiss);
  }, [contextMenu]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  }

  function openContextMenu(x: number, y: number) {
    setContextMenu({ x, y });
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => openContextMenu(touch.clientX, touch.clientY), LONG_PRESS_MS);
  }

  function clearLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  function startNewFolder() {
    setContextMenu(null);
    setNewFolderOpen(true);
    setCreateError(null);
  }

  async function handleCreateFolder() {
    const tag = newFolderName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag) {
      setCreateError("Folder name is required.");
      return;
    }
    if (!newFolderRubric.trim()) {
      setCreateError("A grading rubric is required.");
      return;
    }
    if (!isConnected) {
      setCreateError("Connect a wallet before creating a folder.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const { provider, account } = await getConnectedProviderAndAccount();
      await registerDomain(network, tag, newFolderRubric.trim(), provider, account);
      loadDomains();
      setNewFolderOpen(false);
      setNewFolderName("");
      setNewFolderRubric("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create folder.");
    } finally {
      setCreating(false);
    }
  }

  if (pathname === "/") return null;

  const activeDomain = pathname.startsWith("/explorer/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : undefined;

  const content = (
    <nav className="flex flex-col gap-0.5 px-2 py-2 text-sm">
      <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Quick access
      </p>
      <Link
        href="/submit"
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-ink-muted hover:bg-chrome-hover hover:text-ink"
      >
        <NewFileIcon className="h-4 w-4 text-accent-500" />
        New Case
      </Link>
      <Link
        href="/recent"
        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${
          pathname === "/recent" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
        }`}
      >
        <RecentIcon className="h-4 w-4 text-accent-500" />
        Recent Cases
      </Link>
      <Link
        href="/about"
        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${
          pathname === "/about" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
        }`}
      >
        <InfoIcon className="h-4 w-4 text-accent-500" />
        About
      </Link>
      <Link
        href="/docs"
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-ink-muted hover:bg-chrome-hover hover:text-ink"
      >
        <HelpIcon className="h-4 w-4 text-accent-500" />
        Help
      </Link>

      <p className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        User
      </p>
      <Link
        href="/profile"
        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${
          pathname === "/profile" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
        }`}
      >
        <UserIcon className="h-4 w-4 text-accent-500" />
        User Profile
      </Link>
      <Link
        href="/history"
        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${
          pathname === "/history" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
        }`}
      >
        <HistoryIcon className="h-4 w-4 text-accent-500" />
        History
      </Link>

      <button
        type="button"
        onClick={toggleCollapsed}
        onContextMenu={(e) => {
          e.preventDefault();
          openContextMenu(e.clientX, e.clientY);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearLongPress}
        onTouchMove={clearLongPress}
        className="mt-4 flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-ink-muted hover:bg-chrome-hover hover:text-ink"
      >
        <ThisPcIcon className="h-4 w-4 text-ink-faint" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide">Case Files</span>
        <ChevronDownIcon className={`h-3 w-3 text-ink-faint transition-transform ${collapsed ? "-rotate-90" : ""}`} />
      </button>

      {!collapsed && (
        <div className="ml-4 flex flex-col gap-0.5 border-l border-chrome-border pl-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] ${
              pathname === "/dashboard" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
            }`}
          >
            <ThisPcIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            Practice Areas
          </Link>
          {domains.map((d) => (
            <Link
              key={d.tag}
              href={`/explorer/${d.tag}`}
              className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] ${
                activeDomain === d.tag ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
              }`}
            >
              <span className="h-3.5 w-4 shrink-0">
                <FolderIcon />
              </span>
              <span className="truncate">{domainDisplayName(d.tag)}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop: static, resizable sidebar */}
      <aside
        className="relative hidden shrink-0 border-r border-chrome-border bg-chrome-pane sm:block"
        style={{ width }}
      >
        <div className="h-full overflow-y-auto">{content}</div>
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={() => setResizing(true)}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-accent-500/40"
        />
      </aside>

      {/* Mobile: inline panel, visible by default just like the desktop sidebar; the
          hamburger button in the title bar collapses it away for those who want the space. */}
      {mobileOpen && (
        <aside className="block max-h-[50vh] w-full overflow-y-auto border-b border-chrome-border bg-chrome-pane sm:hidden">
          {content}
        </aside>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] rounded-sm border border-chrome-border bg-white py-1 text-sm shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={startNewFolder}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-ink-muted hover:bg-chrome-hover hover:text-ink"
          >
            <FolderIcon className="h-3.5 w-4" />
            New folder...
          </button>
        </div>
      )}

      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24" onClick={() => setNewFolderOpen(false)}>
          <div className="dialog w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
              <FolderIcon className="h-4 w-4" />
              <span className="text-xs font-semibold text-ink">New Folder</span>
            </div>
            <div className="flex flex-col gap-3 bg-white p-4">
              <div>
                <label className="label">Folder name</label>
                <input
                  className="input"
                  placeholder="e.g. saas-refund-disputes"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="label">Grading rubric</label>
                <textarea
                  className="input min-h-20 resize-y"
                  placeholder="The criteria validators use to judge cases in this folder..."
                  value={newFolderRubric}
                  onChange={(e) => setNewFolderRubric(e.target.value)}
                  disabled={creating}
                />
              </div>
              {createError && <p className="text-xs text-red-600">{createError}</p>}
              <div className="flex items-center justify-end gap-2 border-t border-chrome-border pt-3">
                <button
                  type="button"
                  className="text-xs font-medium text-ink-faint hover:text-ink"
                  onClick={() => setNewFolderOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="button" className="btn-primary !py-1.5 !text-xs" onClick={handleCreateFolder} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
