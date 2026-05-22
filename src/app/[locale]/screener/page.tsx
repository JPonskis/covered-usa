import type { Metadata } from 'next';
import ScreenerContent from '@/components/ScreenerContent';

export const metadata: Metadata = {
  title: 'Check Your Health Insurance Eligibility | CoveredUSA',
  description: 'Answer 10 quick questions to find out if you qualify for free or low-cost health insurance. Medicaid, Medicare, ACA subsidies, CHIP, and VA coverage.',
  robots: { index: false },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string }>;
}

export default async function ScreenerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { focus } = await searchParams;
  const focusValue = focus === 'medicare' ? 'medicare' : undefined;
  return <ScreenerContent locale={locale} focus={focusValue} />;
}
