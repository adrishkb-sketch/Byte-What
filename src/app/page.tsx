'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BarChart2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative overflow-hidden px-4 sm:px-6">
      {/* ByteMonk Cyan & Dark Atmosphere Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[400px] h-[280px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[240px] bg-accent-violet/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Circuit Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 240, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Institutional Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-primary/25 text-xs text-text-secondary mb-6 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-medium text-text-primary">Government College of Engineering and Ceramic Technology</span>
        </motion.div>

        {/* Official ByteMonk Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-5 relative group"
        >
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-primary via-cyan-400 to-accent-violet shadow-2xl shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <img
              src="/bytemonk-logo.png"
              alt="ByteMonk Official Logo"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
          <div className="absolute -inset-3 bg-primary/20 rounded-full blur-xl -z-10 group-hover:bg-primary/35 transition-colors" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2"
        >
          BYTE
          <span className="text-primary ml-2 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            WHAT
          </span>
        </motion.h1>

        {/* Initiative Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs text-primary font-mono tracking-wider uppercase mb-4"
        >
          <span>An initiative under ByteMonk</span>
        </motion.div>

        {/* Minimal Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-text-secondary mb-8 max-w-md mx-auto leading-relaxed"
        >
          Technology Interest Discovery, Verified Peer Collaboration & College Analytics Ecosystem.
        </motion.p>

        {/* The Two Mandatory Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          <Link
            href="/onboarding"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl font-bold text-[#050811] bg-primary hover:bg-primary-hover shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Tell What Interests You</span>
          </Link>

          <Link
            href="/analytics"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl font-bold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-primary/25 hover:border-primary/50 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base backdrop-blur-sm shadow-lg shadow-black/40 hover:text-primary"
          >
            <BarChart2 className="w-5 h-5 text-primary" />
            <span>View Analytics</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
