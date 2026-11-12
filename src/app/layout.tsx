import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'BYTE WHAT — An initiative under ByteMonk | GCECT Technology Platform',
  description:
    'BYTE WHAT is a technology-interest discovery and student collaboration platform, an initiative under ByteMonk at Government College of Engineering and Ceramic Technology (GCECT).',
  keywords: [
    'BYTE WHAT',
    'ByteMonk',
    'GCECT',
    'Government College of Engineering and Ceramic Technology',
    'Tech Discovery',
    'Engineering Interests',
    'Adaptive Questionnaire',
    'Chrome Built-in AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080D18] text-[#F8FAFC] antialiased selection:bg-primary/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

