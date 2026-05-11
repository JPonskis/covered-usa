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
  const utmParams = new URLSearchParams();

  utmKeys.forEach((key) => {
    const val = searchParams.get(key);
    if (val) utmParams.set(key, val);
  });

  const query = utmParams.toString();
  const screenerHref = `/${locale}/screener${query ? `?${query}` : ''}`;

  const padding = size === 'xl' ? '1rem 2.5rem' : '0.875rem 2rem';
  const fontSize = size === 'xl' ? '1.125rem' : '1rem';

  return (
    <Link
      href={screenerHref}
      className="btn-primary"
      style={{
        padding,
        fontSize,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        boxShadow: '0 4px 20px rgba(3,105,161,0.4)',
      }}
    >
      {label}
      <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
