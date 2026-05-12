/**
 * LastUpdated — small date stamp under H1 on data hub pages.
 *
 * Visible to users (freshness signal) and mirrors the `lastReviewed`
 * schema property AI engines parse for temporal relevance.
 */

interface LastUpdatedProps {
  date: string;
  source?: string;
}

export function LastUpdated({ date, source }: LastUpdatedProps) {
  return (
    <p className="text-sm text-[#64748b] mb-6">
      Last updated: {date}
      {source ? ` | Source: ${source}` : ''}
    </p>
  );
}
