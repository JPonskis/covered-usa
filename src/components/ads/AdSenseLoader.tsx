'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { adsAllowedOnPath, adsenseClient } from '@/lib/ads';

/**
 * Loads the AdSense library on content routes only. Off entirely until
 * NEXT_PUBLIC_ADSENSE_CLIENT is set, so merging this changes nothing live.
 *
 * Client-side navigation note: once the library is on the page it stays for
 * the session, which is why Auto ads must run with anchor and vignette
 * formats OFF in the AdSense dashboard (in-page units are torn down with the
 * article DOM on navigation; overlays are not). The dashboard URL exclusions
 * for /screener, /results and /medical-bill-analyzer are the second belt.
 * The allowlist in @/lib/ads is the first.
 */
export default function AdSenseLoader() {
  const pathname = usePathname();
  const client = adsenseClient();
  if (!client || !adsAllowedOnPath(pathname)) return null;
  return (
    <Script
      id="adsense-lib"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
