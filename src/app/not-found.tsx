import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">Domain Not Located</h1>
      <p className="text-text-secondary text-sm max-w-md mb-8">
        The engineering domain or page you are seeking could not be found in the BYTE WHAT catalog.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/interests"
          className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-text-primary text-sm font-semibold hover:bg-white/[0.1] transition-colors"
        >
          Explore All Domains
        </Link>
      </div>
    </div>
  );
}

