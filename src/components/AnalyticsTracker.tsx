'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const tracked = new Set<string>();

const BOT_RE = /bot|crawl|spider|slurp|mediapartners/i;

// AI referral sources to detect
const AI_REFERRERS = [
  { domain: 'chat.openai.com', name: 'chatgpt' },
  { domain: 'chatgpt.com', name: 'chatgpt' },
  { domain: 'perplexity.ai', name: 'perplexity' },
  { domain: 'claude.ai', name: 'claude' },
  { domain: 'gemini.google.com', name: 'gemini' },
  { domain: 'copilot.microsoft.com', name: 'copilot' },
  { domain: 'bing.com/chat', name: 'bing_chat' },
  { domain: 'duckduckgo.com', name: 'duckduckgo_ai' },
  { domain: 'you.com', name: 'you_ai' },
  { domain: 'grok.x.ai', name: 'grok' },
  { domain: 'phind.com', name: 'phind' },
  { domain: 'kagi.com', name: 'kagi' },
  { domain: 'brave.com', name: 'brave_leo' },
  { domain: 'mistral.ai', name: 'mistral' },
  { domain: 'bard.google.com', name: 'gemini' },
];

const AI_SESSION_KEY = 'ai_referral_source';

function detectAiReferrer(): { name: string } | null {
  // Check sessionStorage first (persists across pages within session)
  // Wrapped in try/catch: Safari private mode throws SecurityError on sessionStorage access
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(AI_SESSION_KEY);
  } catch {
    // sessionStorage unavailable (private browsing, iframe, etc.) — continue without it
  }
  if (stored) return { name: stored };

  const ref = document.referrer;
  if (!ref) return null;

  try {
    const url = new URL(ref);
    const hostname = url.hostname;
    const fullPath = hostname + url.pathname;

    for (const source of AI_REFERRERS) {
      if (hostname === source.domain || hostname.endsWith('.' + source.domain) || fullPath.startsWith(source.domain)) {
        try { sessionStorage.setItem(AI_SESSION_KEY, source.name); } catch { /* ignore */ }
        return { name: source.name };
      }
    }
  } catch {
    // Invalid referrer URL, ignore
  }

  return null;
}

declare function gtag(...args: unknown[]): void;

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const hasFired = useRef(false);

  useEffect(() => {
    // Capture UTM attribution on first landing of the session.
    try {
      if (!sessionStorage.getItem('coveredusa_attribution')) {
        const params = new URLSearchParams(window.location.search);
        const hasAnyUtm =
          params.get('utm_source') ||
          params.get('utm_medium') ||
          params.get('utm_campaign');
        if (hasAnyUtm) {
          sessionStorage.setItem(
            'coveredusa_attribution',
            JSON.stringify({
              utmSource: params.get('utm_source') || '',
              utmMedium: params.get('utm_medium') || '',
              utmCampaign: params.get('utm_campaign') || '',
              referrerUrl: document.referrer || '',
              landingPage: window.location.pathname + window.location.search,
            })
          );
        }
      }
    } catch {
      /* sessionStorage blocked (private browsing, sandboxed iframe) */
    }

    // Skip if already tracked this path in this session
    if (tracked.has(pathname)) return;

    // Skip bots
    if (BOT_RE.test(navigator.userAgent)) return;

    // Deduplicate within same component mount
    if (hasFired.current) return;
    hasFired.current = true;

    tracked.add(pathname);

    // Detect AI referral
    const aiSource = detectAiReferrer();

    // Fire GA4 ai_referral event
    if (aiSource && typeof gtag === 'function') {
      gtag('event', 'ai_referral', {
        ai_source: aiSource.name,
        landing_page: pathname,
      });
    }

    // Fire and forget, non-blocking
    const payload: Record<string, string | null> = {
      path: pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    };

    if (aiSource) {
      payload.ai_source = aiSource.name;
    }

    // Use sendBeacon if available for truly non-blocking fire-and-forget
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently fail: analytics should never break the page
      });
    }
  }, [pathname]);

  // Reset hasFired when pathname changes
  useEffect(() => {
    hasFired.current = false;
  }, [pathname]);

  return null;
}
