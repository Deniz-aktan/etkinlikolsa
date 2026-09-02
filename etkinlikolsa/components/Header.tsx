"use client";

import { useState } from "react";
import { Heart, Menu, User, X } from "lucide-react";

const navLinks = [
  { label: "Anasayfa", href: "#" },
  { label: "Etkinlikler", href: "#etkinlikler" },
  { label: "Paketler", href: "#paketler" },
  { label: "Hakkımızda", href: "#" },
  { label: "Blog", href: "#" },
  { label: "İletişim", href: "#" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4-1.5M2 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 4-1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 15l1-8 5-4 5 4v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Etkinlik<span className="text-brand-500">Olsa</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink-light transition hover:text-brand-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            aria-label="Favoriler"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-light transition hover:bg-surface hover:text-brand-500"
          >
            <Heart size={19} />
          </button>
          <button
            aria-label="Hesabım"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-light transition hover:bg-surface hover:text-brand-500"
          >
            <User size={19} />
          </button>
          <a
            href="#paketler"
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
          >
            Teklif Al
          </a>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-ink-light"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#paketler"
              className="mt-2 rounded-full bg-brand-500 px-5 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Teklif Al
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
