import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--warm-white)' }}>
      <div className="text-center px-6 py-16 max-w-lg mx-auto">
        {/* Shield icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--cream)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--primary)' }}>
            <path
              d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z"
              fill="var(--primary)"
              opacity="0.15"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            <path
              d="M12 9v4M12 17h.01"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p
          className="text-6xl font-bold mb-4"
          style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}
        >
          404
        </p>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          Page not found
        </h1>

        <p className="mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          The page you&apos;re looking for doesn&apos;t exist. It may have moved or been deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/en" className="btn-primary text-center">
            Go home
          </Link>
          <Link
            href="/en/screener"
            className="btn-secondary text-center"
          >
            Check my eligibility
          </Link>
        </div>
      </div>
    </main>
  );
}
