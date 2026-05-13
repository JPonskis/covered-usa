/**
 * PullQuote — citeable factual aside.
 *
 * Magazine-style pull-quote for breaking up dense content sections.
 * Designed to be a refined interjection, NOT a competing headline.
 * Use sparingly — one per page max. AI engines may quote this verbatim.
 */

interface PullQuoteProps {
  text: string;
  attribution?: string;
}

export function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <figure className="my-10 max-w-2xl mx-auto">
      <div className="relative pl-6">
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 text-4xl leading-none text-[#c2732a] font-serif select-none"
        >
          &ldquo;
        </span>
        <blockquote className="text-lg md:text-xl italic text-[#334155] leading-relaxed">
          <p data-speakable>{text}</p>
        </blockquote>
        {attribution && (
          <figcaption className="mt-3 text-sm text-[#64748b] not-italic">
            — {attribution}
          </figcaption>
        )}
      </div>
    </figure>
  );
}
