'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomBar() {
  const pathname = usePathname();

  // Hide on screener and bill analyzer pages (including all sub-routes)
  const hideOnPaths = ['/screener', '/medical-bill-analyzer'];
  const shouldHide = hideOnPaths.some((path) => pathname.includes(path));

  if (shouldHide) return null;

  // Extract locale from pathname (first segment after /)
  const locale = pathname.split('/')[1] || 'en';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 sm:hidden"
      style={{
        zIndex: 40,
        background: 'white',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex">
        {/* Check Coverage */}
        <Link
          href={`/${locale}/screener`}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
          style={{ color: 'var(--primary)', textDecoration: 'none' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M10 11h4M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--primary)',
            }}
          >
            Check Coverage
          </span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', background: 'var(--border-light)', margin: '8px 0' }} />

        {/* Check My Bill */}
        <Link
          href={`/${locale}/medical-bill-analyzer`}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
          style={{ color: 'var(--primary)', textDecoration: 'none' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="17" r="3.5" fill="var(--error)" />
            <path d="M16.8 17h2.4M18 15.8v2.4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--primary)',
            }}
          >
            Check My Bill
          </span>
        </Link>
      </div>
    </div>
  );
}
