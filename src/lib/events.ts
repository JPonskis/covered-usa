/**
 * events.ts — Loader for trigger event (life event) data files.
 *
 * Each entry lives at `content/data/events/<slug>.json` and conforms to
 * the `TriggerEvent` interface. Rendered by the dynamic route at
 * `src/app/[locale]/event/[event]/page.tsx`.
 *
 * Uses schema.org `HowTo` (distinct from other templates) for the
 * step-by-step enrollment process. Strong AI citation signal for "how
 * to [enroll/get coverage after X]" queries.
 *
 * Lessons from Phases 2A-2D baked in.
 */

import fs from 'fs';
import path from 'path';

const eventsDir = path.join(process.cwd(), 'content/data/events');

// ─── Localized text shapes ────────────────────────────────────────────────

export interface LocalizedString {
  en: string;
  es: string;
}

export interface LocalizedStringArray {
  en: string[];
  es: string[];
}

export interface LocalizedFAQ {
  question: string;
  answer: string;
}

// ─── Section shapes ───────────────────────────────────────────────────────

/**
 * Urgency type discriminator.
 * - 'deadline': hard "X days from event" cutoff (most SEPs: P60D, P30D, P90D)
 * - 'window': enrollment WINDOW spanning before/during/after (e.g., Medicare IEP
 *   is 7 months centered on 65th birthday — starts 3 months BEFORE, not after)
 * - 'no-deadline': year-round enrollment, no deadline (Medicaid, CHIP)
 */
export type UrgencyKind = 'deadline' | 'window' | 'no-deadline';

/**
 * Urgency callout at the top of every trigger event page.
 * The amber/accent-colored box.
 */
export interface UrgencyNotice {
  /**
   * Urgency type — determines how the writer should frame the heading.
   * Locks the prompt to use correct semantics for non-deadline events.
   */
  kind: UrgencyKind;
  /**
   * Heading text. Phrasing depends on `kind`:
   * - deadline: "You have 60 days from coverage loss date"
   * - window: "Your Medicare enrollment window is 7 months around your 65th birthday"
   * - no-deadline: "You can enroll in Medicaid year-round"
   */
  heading: LocalizedString;
  /** Body sentence: consequences of missing the window OR clarifying detail */
  body: LocalizedString;
  /**
   * ISO 8601 duration for HowTo.totalTime, e.g., "P60D" / "P30D" / "P7M".
   * Required when kind='deadline' or 'window'. Null when kind='no-deadline'.
   */
  totalTimeISO8601: string | null;
  /**
   * Optional secondary deadlines (e.g., job loss has 60-day marketplace SEP
   * AND 30-day spouse plan AND year-round Medicaid). Render as small chips
   * below the main heading.
   */
  secondaryDeadlines?: Array<{
    label: LocalizedString;
    /** Days, or null for year-round/no-deadline */
    days: number | null;
  }>;
}

export interface HowToStep {
  /** Step heading (e.g., "Calculate your new household income") */
  name: LocalizedString;
  /** Step body (1-3 sentences explaining what to do) */
  text: LocalizedString;
}

export interface OptionsComparison {
  /** Headers, typically ["Option", "Typical cost", "Best for", "Deadline"] */
  headers: LocalizedStringArray;
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
}

export interface CommonMistakesSection {
  intro: LocalizedString;
  items: LocalizedString[];
}

export interface DetailSection {
  heading: LocalizedString;
  paragraphs: LocalizedString[];
  list?: LocalizedString[];
  table?: {
    caption: LocalizedString;
    headers: LocalizedStringArray;
    rows: LocalizedStringArray[];
    footnote: LocalizedString;
    source: string;
  };
}

export interface RelatedLink {
  label: LocalizedString;
  href: string;
}

export interface EventSource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full TriggerEvent shape ──────────────────────────────────────────────

/** Locked enum for category. */
export type EventCategory =
  | 'Job Loss'
  | 'Age Milestone'
  | 'Family Change'
  | 'Move / Relocation'
  | 'Income Change'
  | 'Plan Change'
  | 'Lost Other Coverage';

/** CTA target — almost always screener for trigger events. */
export type EventCtaTarget = 'screener' | 'analyzer';

export interface TriggerEvent {
  /** URL slug, also JSON filename (e.g., "just-lost-job-health-insurance") */
  slug: string;
  /**
   * The trigger event name. Used in breadcrumb + schema.about.
   * Localized (e.g., "Just Lost Your Job", "Turning 26").
   */
  eventName: LocalizedString;
  category: EventCategory;
  /** Topic for schema.about (e.g., "Special Enrollment Period after Job Loss") */
  topic: string;
  /** schema.org medicalSpecialty (typically "PublicHealth") */
  medicalSpecialty: string;
  ctaTarget: EventCtaTarget;
  lastUpdated: string;
  readingTime: string;

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    /** H1 — typically a direct question or statement ("Just Lost Your Job? Here Are Your Health Insurance Options") */
    h1: LocalizedString;
    /** 1-2 sentence subhero with the deadline anchor */
    subhero: LocalizedString;
  };

  /** Urgency callout (the amber box at the top) */
  urgency: UrgencyNotice;

  /** Quick Answer blockquote (3-5 sentences summarizing the situation) */
  quickAnswer: LocalizedString;

  /** Intro paragraphs (1-2) */
  introParagraphs: LocalizedString[];

  /**
   * Steps array — drives both the rendered <ol> AND the HowTo schema.
   * Minimum 3 steps, typical 5-7.
   */
  steps: HowToStep[];

  /** Options comparison table (always present — the core decision data) */
  optionsComparison: OptionsComparison;

  /** Common mistakes section (always present — high reader value) */
  commonMistakes: CommonMistakesSection;

  /** Flexible detail sections (MIN 0 — optional for trigger events since steps + options already structure the page) */
  detailSections?: DetailSection[];

  /** FAQs — flat strings */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedLink[];

  sources: EventSource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readEventFile(slug: string): TriggerEvent | null {
  const filePath = path.join(eventsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as TriggerEvent;
    if (parsed.slug !== slug) parsed.slug = slug;
    return parsed;
  } catch (err) {
    console.error(`[events] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

export function getAllEvents(): TriggerEvent[] {
  if (!fs.existsSync(eventsDir)) return [];
  return fs.readdirSync(eventsDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readEventFile(slug))
    .filter((e): e is TriggerEvent => e !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getEventBySlug(slug: string): TriggerEvent | null {
  return readEventFile(slug);
}

export function getAllEventSlugs(): string[] {
  if (!fs.existsSync(eventsDir)) return [];
  return fs.readdirSync(eventsDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

export function pickLocaleArray(lsa: LocalizedStringArray, locale: string): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}
