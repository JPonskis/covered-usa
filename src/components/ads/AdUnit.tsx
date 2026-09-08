'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { adsAllowedOnPath, adsenseClient, adsenseInArticleSlot } from '@/lib/ads';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/**
 * One responsive AdSense unit. Renders nothing unless the client id AND the
 * slot id are configured AND the current route is on the ads allowlist, so a
 * unit dropped into a template by mistake on a tool route stays invisible.
 */
export default function AdUnit({ position }: { position: 'mid' | 'end' }) {
  const pathname = usePathname();
  const ref = useRef<HTMLModElement>(null);
  const client = adsenseClient();
  const slot = adsenseInArticleSlot();
  const enabled = !!client && !!slot && adsAllowedOnPath(pathname);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    // Each <ins> is pushed exactly once; a second push on the same element
    // throws "already have ads in it". The data attribute is the guard.
    if (ref.current.getAttribute('data-adsbygoogle-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // The library may not be loaded yet (blocked, or still downloading).
      // Nothing to do: an empty slot is the correct failure mode.
    }
  }, [enabled, pathname]);

  if (!enabled) return null;
  return (
    <div className="my-8" data-ad-position={position} aria-hidden="true">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
