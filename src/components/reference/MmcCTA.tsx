/**
 * MmcCTA — the cross-site CTA to the Medicare Money Check on BenefitsUSA
 * (MMC PRD Phase 3, projects/benefits-usa/medicare-money-check/PRD.md §7).
 *
 * Medicare-intent pages on CoveredUSA send readers to the purpose-built
 * Medicare tool instead of the generic screener. Three audience flavors per
 * the PRD's mapping: drug/IRMAA/medigap pages pitch the plan-vs-medications
 * report ('drugs'), cobra/employer/retiring-early pages pitch exact dates and
 * the lifetime penalty ('pre65'), everything else pitches the money check
 * ('enrolled').
 *
 * Laws carried over from the MMC build: figure-free copy (no dollar amounts
 * to drift), no call promise, no "every plan" claims, hedged eligibility
 * only, and the sister-site relationship stated plainly. English only — the
 * MMC has no Spanish in v1, so Spanish call sites keep their existing CTA
 * (this component also renders nothing for es, belt and suspenders).
 *
 * The ?src value is what shows up in mmc_events.source on the other side, so
 * keep it the clean page slug: the scorecard groups coveredusa starts by it.
 */

interface MmcCTAProps {
  locale: string;
  /** Clean page identifier (no position suffix) — becomes src=coveredusa-<slug>. */
  slug: string;
  audience: 'enrolled' | 'pre65' | 'drugs';
  /** 'mid-cta' | 'article' | similar — becomes utm_medium. */
  medium?: string;
}

const COPY: Record<MmcCTAProps['audience'], { heading: string; desc: string; btn: string }> = {
  enrolled: {
    heading: 'Are you overpaying for Medicare?',
    desc: 'About 5 questions show your exact dollar answer, from the state programs that pay the Part B premium back to prescription help. Free, on our sister site BenefitsUSA, and you see the result before it asks for anything.',
    btn: 'Check what I might be owed',
  },
  pre65: {
    heading: 'Your Medicare window has exact dates, and a lifetime late penalty',
    desc: 'Your opening and closing dates, computed from your birthday in about 60 seconds, with reminders before each one. Free, on our sister site BenefitsUSA.',
    btn: 'Get my exact dates',
  },
  drugs: {
    heading: 'Your drug plan re-prices every January. Your prescriptions did not move',
    desc: 'A free hand-checked report of what your medications cost on your county’s plans, plus the switch dates that apply to you. On our sister site BenefitsUSA.',
    btn: 'Check my plan against my meds',
  },
};

export function MmcCTA({ locale, slug, audience, medium = 'mid-cta' }: MmcCTAProps) {
  if (locale === 'es') return null;
  const c = COPY[audience];
  const href = `https://benefitsusa.org/en/medicare-money-check?src=${encodeURIComponent(`coveredusa-${slug}`)}&utm_source=coveredusa&utm_medium=${encodeURIComponent(medium)}`;

  return (
    <div
      className="my-10 rounded-2xl border-2 p-6 flex flex-col sm:flex-row items-center gap-5"
      style={{ borderColor: 'var(--teal)', background: 'var(--cream)' }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-lg mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {c.heading}
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
        >
          {c.desc}
        </p>
      </div>
      <a
        href={href}
        className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
        style={{ background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {c.btn}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
