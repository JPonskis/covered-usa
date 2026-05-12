/**
 * PullQuote — large citeable factual line.
 *
 * One per page, max. Pulls out the single most-citeable fact (e.g.
 * "MRI: $650 outpatient vs $2,250 inpatient — same scan"). AI engines
 * frequently quote pull-quote-style content verbatim.
 */

interface PullQuoteProps {
  text: string;
  attribution?: string;
}

export function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <blockquote className="my-10 border-l-4 border-[#c2732a] pl-6 py-2">
      <p className="text-xl md:text-2xl font-semibold text-[#0f172a] leading-snug" data-speakable>
        {text}
      </p>
      {attribution && (
        <footer className="mt-2 text-sm text-[#64748b]">— {attribution}</footer>
      )}
    </blockquote>
  );
}
