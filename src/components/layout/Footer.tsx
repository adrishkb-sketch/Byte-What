import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#080D18] text-text-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center">
                <span className="font-mono font-bold text-white text-sm">BW</span>
              </div>
              <span className="font-bold text-text-primary text-base">BYTE WHAT</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Technology-interest discovery and project-collaboration platform for students of Government College of Engineering and Ceramic Technology (GCECT).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>100% Anonymous • No Account Required</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-text-primary mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/discover/questionnaire" className="hover:text-white transition-colors">
                  Adaptive Questionnaire
                </Link>
              </li>
              <li>
                <Link href="/interests" className="hover:text-white transition-colors">
                  All 20 Technology Domains
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">
                  Student Interest Map
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-white transition-colors">
                  How Discovery Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-text-primary mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/bytemates" className="hover:text-white transition-colors">
                  ByteMates Discovery
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Public Project Showcase
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-white transition-colors">
                  Domain Guilds
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About GCECT & Methodology
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-text-primary mb-3">Ethics & Privacy</h4>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              BYTE WHAT does not collect personal names, email addresses, roll numbers, or contact details. All questionnaires are processed via browser-generated anonymous sessions.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-primary-light">
              <Cpu className="w-3.5 h-3.5" />
              <span>Transparent & Deterministic Scoring</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} BYTE WHAT. Built for GCECT Students.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About Platform
            </Link>
            <Link href="/interests" className="hover:text-white transition-colors">
              Technology Domains
            </Link>
            <Link href="/analytics" className="hover:text-white transition-colors">
              Live Analytics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
