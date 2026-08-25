import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/ui/Navbar';
import { AiCoachPill } from '../components/ai/AiCoachPill';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fluid Git · Physics-Driven Git Visualizer & Learning Engine',
  description: 'Master Git visually through fluid topological physics, step-by-step scrubbers, interactive terminal CLI, and progressive disclosure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="midnight" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans select-none overflow-hidden">
        <Navbar />
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">{children}</main>
        <AiCoachPill />
      </body>
    </html>
  );
}
