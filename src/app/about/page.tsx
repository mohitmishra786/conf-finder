import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            About <span className="gradient-text">Confab</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Your open-source tech conference companion
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Mission */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Mission</h2>
            <p className="text-zinc-400 leading-relaxed">
              Confab is a free, open-source directory of upcoming tech conferences.
              We help developers discover speaking opportunities, find conferences with
              open CFPs, and connect with the tech community worldwide.
            </p>
          </div>

          {/* How it works */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-medium text-white mb-2">Data Aggregation</h3>
                <p className="text-sm text-zinc-500">
                  Conference data is fetched from the open-source confs.tech repository
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <h3 className="font-medium text-white mb-2">Daily Updates</h3>
                <p className="text-sm text-zinc-500">
                  GitHub Actions automatically updates the data every day
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-pink-400 font-bold">3</span>
                </div>
                <h3 className="font-medium text-white mb-2">Zero Cost</h3>
                <p className="text-sm text-zinc-500">
                  Fully static, hosted on Vercel, no databases or paid APIs
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Features</h2>
            <ul className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                CFP tracking with countdown badges for urgent deadlines
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Financial aid indicator for conferences offering speaker support
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Category-based filtering: AI, Web, Mobile, DevOps, Security, and more
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fast search across names, locations, and technology tags
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Python', 'GitHub Actions', 'Vercel'].map(tech => (
                <span key={tech} className="px-3 py-1 rounded-lg text-sm bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-4">Data Source</h2>
            <p className="text-zinc-400 mb-4">
              All conference data is sourced from the community-maintained{' '}
              <a
                href="https://github.com/tech-conferences/conference-data"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                confs.tech repository
              </a>
              . Want to add a conference? Submit a PR there!
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Conferences
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}