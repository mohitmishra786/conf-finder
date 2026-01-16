import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-12 sm:mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-zinc-400 text-sm">
              Confab - Your tech conference companion
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