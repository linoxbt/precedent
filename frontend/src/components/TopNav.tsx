import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Domains" },
  { href: "/submit", label: "Submit Case" },
  { href: "/explorer/freelance-delivery-disputes", label: "Precedent Explorer" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-parchment-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-700 font-serif text-base font-semibold text-parchment-100">
            §
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-navy-900">
            Precedent Engine
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <WalletConnectButton />
      </div>
    </header>
  );
}
