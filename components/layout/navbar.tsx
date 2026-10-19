"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 sticky h-[76px] border-b border-white/[0.08] bg-[#020202]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/trade-mirror-logo.png"
            alt="TradeMirror"
            width={220}
            height={64}
            priority
            className="h-auto w-[140px] sm:w-[165px] lg:w-[185px]"
          />
        </Link>

        {/* CENTER NAV — DESKTOP */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          <Link
            href="/product"
            className="text-[15px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Product
          </Link>

          <Link
            href="/features"
            className="text-[15px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Features
          </Link>

          <Link
            href="/pricing"
            className="text-[15px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Pricing
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-5">
          {/* Sign in — desktop/mobile */}
          <Link
            href="/login"
            className="text-[12px] font-medium text-white/75 transition-colors hover:text-white sm:text-[15px]"
          >
            Sign in
          </Link>

          {/* Start for free — desktop/mobile */}
          <Link
            href="/signup"
            className="flex h-9 items-center rounded-lg border border-white/15 bg-white px-3.5 text-[11px] font-semibold text-black transition-all duration-200 hover:bg-white/90 sm:h-10 sm:px-5 sm:text-[14px]"
          >
            Start for free
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/70 transition hover:bg-white/[0.05] hover:text-white md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-[76px] border-b border-white/[0.08] bg-[#050505]/95 px-4 pb-4 pt-3 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
          <nav className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-2">
            <Link
              href="/product"
              onClick={closeMenu}
              className="flex items-center rounded-xl px-4 py-3.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.04] hover:text-white"
            >
              Product
            </Link>

            <Link
              href="/features"
              onClick={closeMenu}
              className="flex items-center rounded-xl px-4 py-3.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.04] hover:text-white"
            >
              Features
            </Link>

            <Link
              href="/pricing"
              onClick={closeMenu}
              className="flex items-center rounded-xl px-4 py-3.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.04] hover:text-white"
            >
              Pricing
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}