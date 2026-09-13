import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dholera SIR TP 1 — Full Vector GIS Map (Option B)',
  description:
    'Interactive WebGL Vector Map for Dholera Special Investment Region (DSIR) Town Planning Scheme 1 (TP 1 and Sub-Maps 1A-1 to 1B) with Jantri Valuation, instant PDF dossiers, and WhatsApp sharing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
