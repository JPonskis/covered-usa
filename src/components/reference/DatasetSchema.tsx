/**
 * DatasetSchema — emits Schema.org Dataset JSON-LD for tabular hub pages.
 *
 * AI engines treat Dataset schema as a strong signal that the page contains
 * structured, citable data. Use on every page with comparable tables
 * (50-state matrices, FPL charts, premium tables, etc.)
 */

interface DatasetSchemaProps {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  source: string;
  keywords: string[];
}

export function DatasetSchema({ name, description, url, dateModified, source, keywords }: DatasetSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    dateModified,
    creator: {
      '@type': 'Organization',
      name: source,
    },
    keywords: keywords.join(', '),
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
