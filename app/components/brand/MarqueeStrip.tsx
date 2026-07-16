import {MARQUEE_ITEMS} from '~/lib/brand';

/**
 * Slow-scrolling deal strip. Fluorescent background, ink text.
 * Content is duplicated once so the -50% keyframe loops seamlessly.
 */
export function MarqueeStrip() {
  const run = MARQUEE_ITEMS.map((item) => `${item}`);
  return (
    <div
      className="overflow-hidden border-y-2 border-ink bg-fluorescent py-2.5"
      aria-label={MARQUEE_ITEMS.join('. ')}
    >
      <div className="flex w-max animate-marquee" aria-hidden>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {run.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="sign-type whitespace-nowrap px-6 text-sm text-ink"
              >
                {item}
                <span className="pl-12 text-ink/50">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
