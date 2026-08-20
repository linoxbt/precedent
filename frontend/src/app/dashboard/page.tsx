import Link from "next/link";
import DomainCard from "@/components/DomainCard";
import { DOMAINS, getPrecedentsForDomain } from "@/lib/mockData";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-3 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
            On-chain case law
          </p>
          <h1 className="font-serif text-3xl font-semibold text-navy-900">Domain Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-navy-500">
            Every ruling here is checked against the domain&apos;s existing precedent before it&apos;s
            accepted — a growing, self-consistent body of case law instead of isolated judgment calls.
          </p>
        </div>
        <Link href="/submit" className="btn-primary whitespace-nowrap">
          Submit a Case
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.tag}
            domain={domain}
            precedentCount={getPrecedentsForDomain(domain.tag).length}
          />
        ))}
      </div>
    </div>
  );
}
