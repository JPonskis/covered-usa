import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coveredusa.org'),
  verification: {
    other: {
      'msvalidate.01': 'PLACEHOLDER_BING_VERIFY',
    },
  },
  alternates: { canonical: '/' },
  title: "CoveredUSA | Free Health Insurance Eligibility Check",
  description: "Find out if you qualify for free or low-cost health insurance. Check Medicaid, Medicare, ACA marketplace plans, and CHIP eligibility in 2 minutes. Free, confidential, available in Spanish.",
  keywords: ["health insurance", "Medicaid eligibility", "Medicare", "ACA marketplace", "free health insurance", "health coverage", "seguro médico gratis"],
  openGraph: {
    title: "CoveredUSA | Free Health Insurance Eligibility Check",
    description: "Find out if you qualify for free or low-cost health insurance in 2 minutes.",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CoveredUSA - Check Your Health Insurance Eligibility' }],
    siteName: 'CoveredUSA',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CoveredUSA | Free Health Insurance Eligibility Check",
    description: "Find out if you qualify for free or low-cost health insurance in 2 minutes.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
