/**
 * personas.ts — Loader for persona (audience-anchored) data files.
 *
 * Each persona lives at `content/data/personas/<slug>.json` and conforms
 * to the `Persona` interface. Rendered by the dynamic route at
 * `src/app/[locale]/for/[persona]/page.tsx`.
 *
 * Persona pages target an AUDIENCE (gig workers, self-employed, college
 * students, early retirees, etc.) rather than a question or event.
 *
 * Lessons from Phases 2A-2E baked in.
 */

import fs from 'fs';
import path from 'path';

const personasDir = path.join(process.cwd(), 'content/data/personas');

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

export interface OptionsOverview {
  /** Headers, typically ["Option", "Best for", "Typical cost"] */
  headers: LocalizedStringArray;
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
}

/** Per-option detail block — one per row in optionsOverview. */
export interface OptionDetail {
  /** Heading, e.g., "Option 1: ACA Marketplace with Subsidies" */
  heading: LocalizedString;
  paragraphs: LocalizedString[];
}

export interface TrapsSection {
  intro: LocalizedString;
  /** Headers typically ["Trap", "Why to avoid"] */
  headers: LocalizedStringArray;
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
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

export interface PersonaSource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full Persona shape ───────────────────────────────────────────────────

/** Locked category enum. */
export type PersonaCategory =
  | 'Self-Employment'
  | 'Age / Life Stage'
  | 'Employment Status'
  | 'Family Status'
  | 'Income Status'
  | 'Veteran / Service';

/** CTA target — typically screener for persona pages. */
export type PersonaCtaTarget = 'screener' | 'analyzer';

export interface Persona {
  /** URL slug (e.g., "gig-workers", "self-employed", "college-students") */
  slug: string;
  /** Full persona name for hero / schema (e.g., "Gig Workers", "Self-Employed Freelancers") */
  personaName: LocalizedString;
  /** Short name for breadcrumbs */
  shortName: LocalizedString;
  category: PersonaCategory;
  /** Topic for schema.about (e.g., "Self-Employed Health Insurance") */
  topic: string;
  /** schema.org medicalSpecialty (typically "PublicHealth") */
  medicalSpecialty: string;
  ctaTarget: PersonaCtaTarget;
  lastUpdated: string;
  readingTime: string;

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    /** H1 — typically "Health Insurance for [Persona] in 2026" */
    h1: LocalizedString;
    /** 1-2 sentence subhero with the key value prop */
    subhero: LocalizedString;
  };

  /** Quick Answer blockquote (3-5 sentences) */
  quickAnswer: LocalizedString;

  /** Intro paragraphs (1-2) */
  introParagraphs: LocalizedString[];

  /** Options overview table (always present) */
  optionsOverview: OptionsOverview;

  /**
   * Per-option detail sections. Typically 3 (matching the 3 options in the table).
   * Each is a heading + paragraphs.
   */
  optionDetails: OptionDetail[];

  /** Traps section — pitfalls specific to this persona */
  traps: TrapsSection;

  /**
   * Persona-specific detail sections (tax deduction for self-employed,
   * income projection for variable earners, dual-eligible angle, etc.).
   * Flexible array — min 1 for persona-specific value.
   */
  detailSections: DetailSection[];

  /** FAQs — flat strings */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedLink[];

  sources: PersonaSource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readPersonaFile(slug: string): Persona | null {
  const filePath = path.join(personasDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as Persona;
    if (parsed.slug !== slug) parsed.slug = slug;
    return parsed;
  } catch (err) {
    console.error(`[personas] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

export function getAllPersonas(): Persona[] {
  if (!fs.existsSync(personasDir)) return [];
  return fs.readdirSync(personasDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readPersonaFile(slug))
    .filter((p): p is Persona => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getPersonaBySlug(slug: string): Persona | null {
  return readPersonaFile(slug);
}

export function getAllPersonaSlugs(): string[] {
  if (!fs.existsSync(personasDir)) return [];
  return fs.readdirSync(personasDir)
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
