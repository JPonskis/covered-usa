'use client';

import { useEffect } from 'react';

/**
 * Adds .drop-cap to the first <p> in .article-content that isn't
 * fully wrapped in <em> or <strong> (skips "Last updated" and disclaimers).
 */
export default function BlogDropCap() {
  useEffect(() => {
    const container = document.querySelector('.article-content');
    if (!container) return;

    const paragraphs = container.querySelectorAll(':scope > p');
    for (const p of paragraphs) {
      // Skip if the paragraph's only child is an <em> or <strong>
      const firstChild = p.firstElementChild;
      if (
        firstChild &&
        p.childNodes.length === 1 &&
        (firstChild.tagName === 'EM' || firstChild.tagName === 'STRONG')
      ) {
        continue;
      }
      // Found the first real content paragraph
      p.classList.add('drop-cap');
      break;
    }
  }, []);

  return null;
}
