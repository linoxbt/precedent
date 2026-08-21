"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { domainDisplayName, listDomains } from "@/lib/genlayerClient";
import { isContractConfigured } from "@/lib/genlayerConfig";
import {
  ChevronDownIcon,
  FolderIcon,
  HelpIcon,
  InfoIcon,
  NewFileIcon,
  RecentIcon,
  ThisPcIcon,
} from "./icons";
import type { DomainConfig } from "@/lib/types";

export default function NavigationPane() {
  const pathname = usePathname();
  const [domains, setDomains] = useState<DomainConfig[]>([]);

  useEffect(() => {
    if (!isContractConfigured()) return;
    listDomains()
      .then(setDomains)
      .catch(() => setDomains([]));
  }, []);

  if (pathname === "/") return null;

  const activeDomain = pathname.startsWith("/explorer/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : undefined;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-chrome-border bg-chrome-pane py-2 sm:block">
      <nav className="flex flex-col gap-0.5 px-2 text-sm">
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
          Case Files
        </p>
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${
            pathname === "/dashboard" ? "bg-chrome-selected text-ink" : "text-ink-muted hover:bg-chrome-hover hover:text-ink"
          }`}
        >
          <ThisPcIcon className="h-4 w-4 text-ink-faint" />
          Practice Areas
          <ChevronDownIcon className="ml-auto h-3 w-3 text-ink-faint" />
        </Link>

        <div className="ml-4 flex flex-col gap-0.5 border-l border-chrome-border pl-2">
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
      </nav>
    </aside>
  );
}
