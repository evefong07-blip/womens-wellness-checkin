"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Submissions" },
  { href: "/", label: "Public form" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <nav className="space-y-2" aria-label="Admin navigation">
      {navItems.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href;
        return (
          <Link
            className={`flex min-h-11 items-center rounded-md px-3 text-sm font-semibold transition ${
              active ? "bg-rose-700 text-white" : "text-stone-700 hover:bg-rose-50"
            }`}
            href={item.href}
            key={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-stone-200 bg-white px-4 py-6 lg:block">
        <p className="text-sm font-medium text-rose-700">Evelyn admin</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Wellness Check-In</h1>
        <div className="mt-8">{nav}</div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-rose-700">Evelyn admin</p>
            <p className="truncate text-base font-semibold">Wellness Check-In</p>
          </div>
          <button
            aria-expanded={menuOpen}
            aria-label="Open navigation menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-stone-300 bg-white text-2xl leading-none"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
        {menuOpen && <div className="mt-3 border-t border-stone-200 pt-3">{nav}</div>}
      </header>

      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
