import type { Metadata } from "next";
import { Source_Serif_4, Fraunces } from "next/font/google";
import "./globals.css";
import AdSenseLoader from "@/components/ads/AdSenseLoader";
import { adsenseClient } from "@/lib/ads";

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

// AdSense reads <meta name="google-adsense-account"> to verify site ownership.
// It loads no ads by itself, and it is emitted only once a publisher id is
// configured, so with no env set the head is byte-identical to before.
const adsenseAccount = adsenseClient();

export const metadata: Metadata = {
  metadataBase: new URL('https://coveredusa.org'),
  verification: {
    other: {
      'msvalidate.01': 'PLACEHOLDER_BING_VERIFY',
    },
  },
  ...(adsenseAccount ? { other: { 'google-adsense-account': adsenseAccount } } : {}),
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
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sourceSerif.variable} ${fraunces.variable}`}>
        <AdSenseLoader />
        {children}
      </body>
    </html>
  );
}
