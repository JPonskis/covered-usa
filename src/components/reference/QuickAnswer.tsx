/**
 * QuickAnswer — the AI-snippet target block.
 *
 * Placed inside the hero region of every programmatic page so it sits
 * directly under the H1/subhead, not as an orphaned block below. AI search
 * engines (ChatGPT, Perplexity, Copilot, Gemini) pull this block as the
 * direct-answer snippet. Must contain specific 2026 numbers and a
 * standalone, citable summary.
 *
 * Page consumers should wrap this in max-w-3xl (or similar) to keep
 * line lengths readable.
 *
 * data-speakable marks the text for voice-assistant extraction.
 */

interface QuickAnswerProps {
  text: string;
  locale?: string;
}

export function QuickAnswer({ text, locale }: QuickAnswerProps) {
  const isEs = locale === 'es';
  return (
    <aside
      className="bg-[#ccfbf1] border-l-4 border-[#0d9488] rounded-r-lg px-5 py-4"
      aria-label={isEs ? 'Respuesta rápida' : 'Quick Answer'}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e] mb-1.5">
        {isEs ? 'Respuesta Rápida' : 'Quick Answer'}
      </p>
      <p className="text-[#0f172a] text-[15px] leading-relaxed" data-speakable>
        {text}
      </p>
    </aside>
  );
}
