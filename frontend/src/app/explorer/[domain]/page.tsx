import { notFound } from "next/navigation";
import { domainDisplayName, getDomain, getDomainPrecedents } from "@/lib/genlayerClient";
import ExplorerTable from "@/components/ExplorerTable";

export default async function PrecedentExplorerPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: domainTag } = await params;
  const domain = await getDomain(domainTag).catch(() => undefined);
  if (!domain) {
    notFound();
  }

  const precedents = await getDomainPrecedents(domainTag);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Precedent Explorer</p>
      <h1 className="font-serif text-3xl font-semibold text-navy-900">{domainDisplayName(domain.tag)}</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">{domain.rubric}</p>

      <div className="mt-8">
        <ExplorerTable precedents={precedents} />
      </div>
    </div>
  );
}
