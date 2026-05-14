import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getAllProcedureSlugs, getProcedureBySlug } from '@/lib/procedures';
import { getAllDrugSlugs, getDrugBySlug } from '@/lib/drugs';
import { getAllQASlugs, getQABySlug } from '@/lib/qa';
import { getAllGlossarySlugs, getGlossaryBySlug } from '@/lib/glossary';
import { getAllEventSlugs, getEventBySlug } from '@/lib/events';
import { getAllPersonaSlugs, getPersonaBySlug } from '@/lib/personas';
import { getAllMAStateSlugs, getMAStateBySlug } from '@/lib/medicare-advantage';

const BASE_URL = 'https://coveredusa.org';

function localizedEntry(
  path: string,
  options?: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority?: number;
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}/en${path}`,
    lastModified: options?.lastModified ?? new Date(),
    changeFrequency: options?.changeFrequency ?? 'monthly',
    priority: options?.priority ?? 0.5,
    alternates: {
      languages: {
        en: `${BASE_URL}/en${path}`,
        es: `${BASE_URL}/es${path}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  // Only include ES alternate when the ES translation actually exists.
  // Pointing to non-existent ES URLs creates 404s that hurt crawl budget.
  const esPostSlugs = new Set(getAllPosts('es').map((p) => p.slug));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const hasEs = esPostSlugs.has(post.slug);
    return {
      url: `${BASE_URL}/en/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/blog/${post.slug}`,
          ...(hasEs ? { es: `${BASE_URL}/es/blog/${post.slug}` } : {}),
        },
      },
    };
  });

  const localizedPages: MetadataRoute.Sitemap = [
    localizedEntry('/', { changeFrequency: 'daily', priority: 1.0 }),
    localizedEntry('/screener', { changeFrequency: 'weekly', priority: 0.95 }),
    localizedEntry('/medical-bill-analyzer', { changeFrequency: 'weekly', priority: 0.95 }),
    localizedEntry('/blog', { changeFrequency: 'daily', priority: 0.8 }),
    localizedEntry('/about', { changeFrequency: 'monthly', priority: 0.5 }),
    // Reference/data pages (AI citation optimized)
    localizedEntry('/medicaid-income-limits', { changeFrequency: 'yearly', priority: 0.8 }),
    localizedEntry('/medicare-eligibility', { changeFrequency: 'yearly', priority: 0.8 }),
    localizedEntry('/aca-income-limits', { changeFrequency: 'yearly', priority: 0.8 }),
    localizedEntry('/federal-poverty-level', { changeFrequency: 'yearly', priority: 0.9 }),
  ];

  // Procedure cost pages — auto-pulled from content/data/procedures/*.json
  const procedureEntries: MetadataRoute.Sitemap = getAllProcedureSlugs().map((slug) => {
    const data = getProcedureBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/cost/${slug}`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  });

  // Drug pages — auto-pulled from content/data/drugs/*.json
  const drugEntries: MetadataRoute.Sitemap = getAllDrugSlugs().map((slug) => {
    const data = getDrugBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/drug/${slug}`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  });

  // Q&A pages — auto-pulled from content/data/qa/*.json
  const qaEntries: MetadataRoute.Sitemap = getAllQASlugs().map((slug) => {
    const data = getQABySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/qa/${slug}`, {
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.85,
    });
  });

  // Glossary pages — auto-pulled from content/data/glossary/*.json
  const glossaryEntries: MetadataRoute.Sitemap = getAllGlossarySlugs().map((slug) => {
    const data = getGlossaryBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/glossary/${slug}`, {
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.85,
    });
  });

  // Trigger event pages — auto-pulled from content/data/events/*.json
  const eventEntries: MetadataRoute.Sitemap = getAllEventSlugs().map((slug) => {
    const data = getEventBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/event/${slug}`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  });

  // Persona pages — auto-pulled from content/data/personas/*.json
  const personaEntries: MetadataRoute.Sitemap = getAllPersonaSlugs().map((slug) => {
    const data = getPersonaBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/for/${slug}`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  });

  // State Medicare Advantage pages — auto-pulled from content/data/medicare-advantage/*.json
  // Priority 0.9 — these are higher-monetization (broker commission) than Phase 2 templates.
  const maStateEntries: MetadataRoute.Sitemap = getAllMAStateSlugs().map((slug) => {
    const data = getMAStateBySlug(slug);
    const lastModified = data?.lastUpdated ? new Date(data.lastUpdated) : new Date();
    return localizedEntry(`/medicare-advantage/${slug}`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  });

  return [
    ...localizedPages,
    ...procedureEntries,
    ...drugEntries,
    ...qaEntries,
    ...glossaryEntries,
    ...eventEntries,
    ...personaEntries,
    ...maStateEntries,
    ...blogEntries,
  ];
}
