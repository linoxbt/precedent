import Link from "next/link";
import { domainDisplayName } from "@/lib/genlayerClient";
import { FolderIcon } from "./icons";
import type { DomainConfig } from "@/lib/types";

export default function DomainCard({ domain, precedentCount }: { domain: DomainConfig; precedentCount: number }) {
  return (
    <Link
      href={`/explorer/${domain.tag}`}
      title={domain.rubric}
      className="group flex w-32 flex-col items-center gap-1.5 rounded-sm px-2 py-3 text-center hover:bg-chrome-hover"
    >
      <span className="h-14 w-16 drop-shadow-sm transition-transform group-hover:scale-105">
        <FolderIcon />
      </span>
      <span className="line-clamp-2 text-xs font-medium text-ink">{domainDisplayName(domain.tag)}</span>
      <span className="text-[11px] text-ink-faint">{precedentCount} items</span>
    </Link>
  );
}
