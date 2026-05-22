'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CtaButtonProps {
  locale: string;
  label: string;
  size?: 'lg' | 'xl';
}

export function CtaButton({ locale, label, size = 'xl' }: CtaButtonProps) {
  const searchParams = useSearchParams();

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const passthroughParams = new URLSearchParams();

  utmKeys.forEach((key) => {
    const val = searchParams.get(key);
    if (val) passthroughParams.set(key, val);
  });

  // Forward focus=medicare so the screener can swap to its Medicare-tailored question set
  const focus = searchParams.get('focus');
  if (focus === 'medicare') passthroughParams.set('focus', 'medicare');

  const query = passthroughParams.toString();
  const screenerHref = `/${locale}/screener${query ? `?${query}` : ''}`;

  const isXl = size === 'xl';

  return (
    <Link
      href={screenerHref}
      className="cta-btn w-full sm:w-auto"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: isXl ? '1.125rem 3rem' : '0.875rem 2rem',
        fontSize: isXl ? '1.125rem' : '1rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        fontFamily: 'var(--font-display), -apple-system, sans-serif',
        color: '#ffffff',
        background: '#0d9488',
        borderRadius: '12px',
        border: 'none',
        textDecoration: 'none',
        maxWidth: '24rem',
        boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#0f766e';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#0d9488';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,148,136,0.35)';
      }}
    >
      {label}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
