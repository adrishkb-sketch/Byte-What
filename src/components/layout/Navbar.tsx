'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart2, Sparkles, Home, ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/account', label: 'My Account', icon: Sparkles },
  { href: '/admin', label: 'Admin Portal', icon: ShieldCheck },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-[#050811]/90 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/bytemonk-logo.png"
              alt="ByteMonk Official Logo"
              className="w-9 h-9 rounded-lg object-cover border border-primary/40 shadow-md shadow-primary/30 group-hover:scale-105 group-hover:border-primary transition-all"
            />
            <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-sm -z-10 group-hover:bg-primary/40 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span>BYTE WHAT</span>
            </span>
            <span className="text-[9px] text-primary/80 font-mono tracking-wider">
              An initiative under ByteMonk
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-primary/15 border border-primary/35 shadow-sm shadow-primary/20'
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover transition-all shadow-md shadow-primary/30 hover:shadow-primary/50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tell What Interests You</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0B1220] px-4 pt-3 pb-5 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-white bg-primary/20 border border-primary/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-text-muted" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center block py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent-violet"
            >
              Tell What Interests You
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
