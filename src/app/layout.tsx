import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'BYTE WHAT — Technology-Interest Discovery & Student Collaboration',
  description:
    'Discover genuine engineering and technology interests through an adaptive 200-questionnaire engine, explore 20 domains, find student collaborators, and build projects at GCECT.',
  keywords: [
    'BYTE WHAT',
    'GCECT',
    'Government College of Engineering and Ceramic Technology',
    'Tech Discovery',
    'Engineering Interests',
    'Adaptive Questionnaire',
    'ByteMates',
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
