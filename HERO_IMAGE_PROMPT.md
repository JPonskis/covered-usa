# CoveredUSA Hero Illustration — AI Image Generation Prompt

## Context (for you, not part of the prompt)

**Where this goes:** Right column of the hero section on coveredusa.org. Two-column grid layout on desktop (stacks/hides on mobile). The image column is approximately 544px wide. The background is warm ivory cream (#FDF8F3) with a very subtle amber cross-hatch texture.

**What it needs to do:** Make the site feel trustworthy, warm, and legitimate. Convey "health coverage" and "protection" without being clinical or corporate. The three figures represent the site's audiences: young adults (ACA/Medicaid), seniors (Medicare), and families with kids (CHIP).

**Style rationale:** Stylized editorial illustration avoids two failure modes — stock-photo-generic AND AI-uncanny-valley. Simplified characters with minimal facial detail play to AI generators' strengths. After adversarial review by a critic agent, the prompt was restructured: shortened for better generator compliance, hand contradictions resolved, rendering effects simplified to physical metaphors, and hex codes moved to reference notes.

**Recommended generator:** Midjourney v6+ (best for illustration styles). DALL-E 3 or Ideogram also work.

---

## THE PROMPT (copy this entire block)

A warm editorial illustration in the style of Headspace app artwork, but with slightly more textured, painterly brushwork — not perfectly flat vectors. Three stylized people standing together in a relaxed group: a young woman in her late twenties with dark hair pulled back, wearing a rich teal top and cream trousers; an older gentleman in his mid-sixties with short silver hair, wearing a warm rust-brown cardigan and brown slacks; and a small child around age five with soft curly brown hair, standing between them and leaning gently against the older man's side.

All figures have simplified geometric forms — soft oval heads, small dot eyes, gentle curved smiles, minimal detail. The young woman has medium-warm brown skin, the older man has a lighter olive complexion, and the child has deep warm brown skin. No hands or fingers are visible anywhere — the woman's hands are behind her back, the man's are in his cardigan pockets, and the child's arms are tucked between the two adults. Figures fade below mid-calf into the warm ivory background, no feet visible.

A broad, soft brushstroke arc of teal watercolor sweeps overhead like a protective canopy, lighter at its peak, richer at the base. Behind the arc, a very soft diffused golden-amber sunrise glow. The background is warm ivory cream, lightest near the figures, softening to white at the edges. Subtle warm-toned edges where figures overlap for definition at small sizes. Visible canvas grain texture throughout. Soft warm shadows only.

Limited color palette: rich warm teal, lighter teal, deep forest teal for darkest accents, warm rust-brown, soft gold, ivory cream, and natural skin tones. No other colors.

Only people and the abstract arc — no objects in the scene. No text, words, or writing. Generous breathing room at edges, portrait composition.

---

## Platform-Specific Instructions

### Midjourney
```
[paste the prompt above] --ar 4:5 --style raw --s 150 --no text words letters numbers writing medical equipment stethoscope syringe pills phones laptops screens flags hands fingers detailed-hands black-outlines
```

### DALL-E 3
Use the prompt as-is. Set size to 1024x1792 (portrait). Set style to "natural" (not "vivid").

### Ideogram
Use the prompt as-is. Set aspect ratio to 4:5. Select "Illustration" style.

---

## Color Reference (for your eyes, not in the prompt)

The prompt uses natural language color descriptions. Here are the exact hex codes from the site CSS for comparison when evaluating outputs:

| Prompt Description | Site Hex | CSS Variable |
|---|---|---|
| Rich warm teal | #0d9488 | --primary |
| Lighter teal | #14b8a6 | --teal-light |
| Deep forest teal | #134e4a | --primary-deeper |
| Warm rust-brown | #c2732a | --accent |
| Soft gold | #D4956A | (amber tone) |
| Ivory cream (background) | #FDF8F3 | --cream |

If the generated background isn't an exact match, CSS can blend it — a `mix-blend-mode` or gradient overlay will handle it.

---

## After Generation

1. **Check for artifacts:** garbled text, visible hands/fingers, extra limbs, distorted faces
2. **Check palette:** teal + cream + amber tones? No random blues, purples, or reds?
3. **Check composition:** breathing room at edges? Figures not cropped awkwardly?
4. **Save as:** PNG, minimum 1024px on the short side (ideally 1024x1280 at 4:5)
5. **Drop it in:** `public/hero-illustration.png` and tell me — I'll wire it into the site

---

## Design Decisions Log

| Decision | Why |
|----------|-----|
| Three people (young, old, child) | Represents all programs: ACA, Medicare, CHIP |
| Teal watercolor arc | Visual metaphor for "coverage" — physical metaphor renders better than "translucent glow" |
| No hands visible anywhere | AI generators consistently fail at hands — all three figures have explicit hand-hiding |
| Simplified geometric faces | Avoids uncanny valley, keeps warmth |
| Specific skin tones per figure | "Diverse" alone leaves too much to generator bias |
| Specific hair descriptions | Prevents random AI choices, reinforces style consistency |
| Lower body fades to cream | Avoids foot/shoe rendering issues, creates seamless web integration |
| Limited palette from site CSS | Illustration feels native, not pasted on |
| 4:5 portrait ratio | Better fit for hero column than 1:1 square (less vertical space wasted) |
| Headspace as primary style ref | Single clear reference > multiple conflicting ones |
| Canvas grain texture | Adds warmth and craft feel, distinguishes from flat vector |
| Warm-toned soft edges | Maintains figure definition at small web sizes without harsh outlines |
| No sage green | Was confusing the palette — 5 chromatic hues + cream is enough |
| Exclusions in --no params | Generators ignore end-of-prompt negations; --no flag is enforced |
| Prompt under 200 words | Generators lose attention on long prompts — front-loaded key elements |
