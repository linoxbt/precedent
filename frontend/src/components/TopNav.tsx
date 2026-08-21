"use client";

import { useState } from "react";
import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Domains" },
  { href: "/submit", label: "Submit Case" },
  { href: "/explorer/freelance-delivery-disputes", label: "Precedent Explorer" },
  { href: "/docs", label: "Docs" },
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-parchment-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
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

        <div className="hidden md:block">
          <WalletConnectButton />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md text-navy-700 hover:bg-navy-50 md:hidden"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-opacity ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-navy-100 bg-parchment-100 px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3.5 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-navy-100 pt-4">
            <WalletConnectButton />
          </div>
        </nav>
      )}
    </header>
  );
}
