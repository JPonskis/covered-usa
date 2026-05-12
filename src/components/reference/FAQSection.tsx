/**
 * FAQSection — renders a list of FAQs as cards.
 *
 * Schema emission is OPTIONAL because pages often emit a single
 * combined @graph JSON-LD. Set emitSchema={true} for standalone use.
 */

import { getFAQSchema } from '@/lib/structured-data';

interface FAQSectionProps {
  faqs: { question: string; answer: string }[];
  emitSchema?: boolean;
}

export function FAQSection({ faqs, emitSchema = false }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <>
      {emitSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))) }}
        />
      )}
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <h3 className="font-semibold text-[#0f172a] mb-2 text-base">{faq.question}</h3>
            <p className="text-[#475569] text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
