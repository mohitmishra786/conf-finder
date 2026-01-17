import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-12 sm:mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="ConfScout Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <span className="text-zinc-400 text-sm">
              ConfScout - Your tech conference companion
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-zinc-500" aria-label="Footer navigation">
            <a
              href="https://github.com/tech-conferences/conference-data"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors min-h-[2.75rem] flex items-center"
            >
              Data Source
            </a>
            <a
              href="https://github.com/mohitmishra786/conf-finder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors min-h-[2.75rem] flex items-center"
            >
              GitHub
            </a>
            <a
              href="https://buymeacoffee.com/mohitmishra7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors min-h-[2.75rem] flex items-center"
            >
              Support
            </a>
          </nav>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-zinc-800/50 text-center text-xs text-zinc-600">
          <p>Data updated daily via GitHub Actions. Zero-cost infrastructure.</p>
          <p className="mt-2">
            Built with{' '}
            <Link href="/about" className="text-zinc-500 hover:text-white transition-colors">
              Next.js, TypeScript & Tailwind
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}