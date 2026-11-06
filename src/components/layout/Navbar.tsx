'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X, Sparkles, Users, FolderGit2, BarChart2, Info, Layers } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover Interests', icon: Sparkles, badge: 'Adaptive' },
  { href: '/interests', label: 'Explore Domains', icon: Compass },
  { href: '/bytemates', label: 'ByteMates', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/communities', label: 'Communities', icon: Layers },
  { href: '/analytics', label: 'Student Map', icon: BarChart2 },
  { href: '/about', label: 'About', icon: Info },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#080D18]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="font-mono font-bold text-white text-lg tracking-tighter">BW</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-text-primary tracking-tight group-hover:text-primary-light transition-colors">
              BYTE WHAT
            </span>
            <span className="text-[10px] text-text-muted font-medium tracking-wide uppercase">
              GCECT Tech Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/discover/questionnaire"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Tell What Interests You</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
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
        <div className="lg:hidden border-b border-white/[0.08] bg-[#0B1220] px-4 pt-3 pb-5 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-white bg-primary/20 border border-primary/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {Icon && <Icon className="w-4 h-4 text-text-muted" />}
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-violet/20 text-accent-violet">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3">
            <Link
              href="/discover/questionnaire"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center block py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent-violet"
            >
              Start Interest Questionnaire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
