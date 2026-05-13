import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

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
    // Glossary / definitional pages (screener funnel)
    localizedEntry('/out-of-pocket-maximum', { changeFrequency: 'yearly', priority: 0.85 }),
    // Trigger event pages (life-event triggers, screener funnel)
    localizedEntry('/just-lost-job-health-insurance', { changeFrequency: 'monthly', priority: 0.85 }),
    // Persona pages (audience-targeted, screener funnel)
    localizedEntry('/health-insurance-for-gig-workers', { changeFrequency: 'monthly', priority: 0.85 }),
    // Q&A pages (single-question deep-dives, screener funnel)
    localizedEntry('/does-medicare-cover-dental', { changeFrequency: 'yearly', priority: 0.85 }),
    // Procedure cost pages (analyzer funnel)
    localizedEntry('/cost/mri', { changeFrequency: 'monthly', priority: 0.85 }),
    // Drug pages (inpatient billing angle, analyzer funnel)
    localizedEntry('/drug/insulin-cost', { changeFrequency: 'monthly', priority: 0.85 }),
  ];

  return [
    ...localizedPages,
    ...blogEntries,
  ];
}
