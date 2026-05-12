/**
 * QuickAnswer — the AI-snippet target block.
 *
 * Placed near the top of every programmatic page. AI search engines
 * (ChatGPT, Perplexity, Copilot, Gemini) pull this block as the
 * direct-answer snippet. Must contain specific 2026 numbers and a
 * standalone, citable summary.
 *
 * data-speakable attribute marks the text for voice-assistant extraction.
 */

interface QuickAnswerProps {
  text: string;
  locale?: string;
}

export function QuickAnswer({ text, locale }: QuickAnswerProps) {
  const isEs = locale === 'es';
  return (
    <aside
      className="bg-[#ccfbf1] border-l-4 border-[#0d9488] rounded-r-xl px-6 py-5 my-6"
      aria-label={isEs ? 'Respuesta rápida' : 'Quick Answer'}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] mb-2">
        {isEs ? 'Respuesta Rápida' : 'Quick Answer'}
      </p>
      <p className="text-[#0f172a] text-base leading-relaxed" data-speakable>
        {text}
      </p>
    </aside>
  );
}
