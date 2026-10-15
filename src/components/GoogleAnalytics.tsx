'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  GA_MEASUREMENT_ID,
  analyticsCampaign,
  analyticsLocation,
  analyticsReferrer,
} from '@/lib/google-analytics';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Enhanced measurement must remain OFF for this stream. We send one controlled
 * pageview per navigation, with no form data, result IDs or raw query strings.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const previousPage = useRef<string | null>(null);

  useEffect(() => {
    // Development/preview traffic should not enter the production property.
    if (!/^(www\.)?coveredusa\.org$/.test(window.location.hostname)) return;

    const location = analyticsLocation(window.location.href);
    if (previousPage.current === location) return;

    const page = {
      page_location: location,
      page_referrer: previousPage.current ?? analyticsReferrer(document.referrer),
      page_title: /\/results(?:\/|$)/.test(pathname)
        ? 'Results | CoveredUSA'
        : document.title,
    };

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      // gtag requires the arguments object, rather than a rest-parameter array.
      window.dataLayer!.push(arguments);
    };
    const gtag = window.gtag;

    // Also sanitize the defaults used by automatic session/engagement events.
    gtag('set', page);

    if (!document.getElementById('coveredusa-google-analytics')) {
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ...analyticsCampaign(window.location.search),
      });
      const script = document.createElement('script');
      script.id = 'coveredusa-google-analytics';
      script.async = true;
      script.referrerPolicy = 'origin';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    gtag('event', 'page_view', { ...page, send_to: GA_MEASUREMENT_ID });
    previousPage.current = location;
  }, [pathname]);

  return null;
}
