import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'InsideJava — Interactive Core Java Learning Platform',
    template: '%s | InsideJava',
  },
  description:
    'The most interactive Core Java learning platform. Master Java from beginner to MAANG level with live visualizations, code examples, and interview preparation.',
  keywords: [
    'Java',
    'Core Java',
    'OOP',
    'Collections',
    'Multithreading',
    'Design Patterns',
    'Java 8',
    'Java 17',
    'Java 21',
    'Interview Preparation',
    'MAANG',
    'Java Streams',
    'Generics',
    'Exception Handling',
  ],
  authors: [{ name: 'Saurabh Sonawane', url: 'https://github.com/Saurabhsds13' }],
  creator: 'Saurabh Sonawane',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://saurabhsds13.github.io/Inside-Java',
    title: 'InsideJava — Interactive Core Java Learning Platform',
    description:
      'Master Core Java with interactive visualizations, code examples, and interview prep. Beginner to MAANG level.',
    siteName: 'InsideJava',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsideJava — Interactive Core Java Learning Platform',
    description: 'Master Core Java with interactive visualizations. OOP, Collections, Streams, Design Patterns & more.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
