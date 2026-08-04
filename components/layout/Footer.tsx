import Link from 'next/link';
import { Coffee, Github, ExternalLink } from 'lucide-react';
import { navItems } from '@/data/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const resources = [
    { label: 'Java SE Documentation', href: 'https://docs.oracle.com/en/java/javase/21/' },
    { label: 'JLS (Java Language Spec)', href: 'https://docs.oracle.com/javase/specs/jls/se21/html/index.html' },
    { label: 'OpenJDK', href: 'https://openjdk.org/' },
    { label: 'Effective Java - Bloch', href: 'https://www.oreilly.com/library/view/effective-java/9780134686097/' },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#060b14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="font-bold text-[15px]">
                <span className="text-white">Inside</span>
                <span className="gradient-text">Java</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The most interactive Core Java learning platform. Master Java from beginner to MAANG level.
            </p>
            <a
              href="https://github.com/Saurabhsds13/Inside-Java"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          {/* Beginner */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Beginner</h3>
            <ul className="space-y-2">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intermediate */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Intermediate</h3>
            <ul className="space-y-2">
              {navItems.slice(6, 12).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Advanced</h3>
            <ul className="space-y-2">
              {navItems.slice(12).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Official Docs</h3>
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {r.label}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {currentYear} InsideJava — Designed & built by{' '}
            <a
              href="https://github.com/Saurabhsds13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Saurabh Sonawane
            </a>
          </p>
          <p className="text-xs text-slate-600">
            Powered by{' '}
            <span className="text-slate-500">Next.js · Framer Motion · Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
