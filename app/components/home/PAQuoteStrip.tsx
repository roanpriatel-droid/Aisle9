import {useEffect, useState} from 'react';
import {PA_ANNOUNCEMENTS} from '~/lib/brand';

/**
 * IN-STORE PA quote strip — an overhead-speaker announcement that rotates
 * through deadpan PA lines. Fluorescent panel, a speaker glyph, big quiet type.
 * Respects reduced-motion (no rotation). The PA never winks.
 */
export function PAQuoteStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (PA_ANNOUNCEMENTS.length < 2) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(
      () => setIndex((i) => (i + 1) % PA_ANNOUNCEMENTS.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label="In-store announcements"
      className="border-b-2 border-ink bg-fluorescent"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-10">
        <span aria-hidden className="pa-speaker" />
        <p
          className="sign-type text-xl text-ink sm:text-3xl"
          role="status"
          aria-live="off"
        >
          {PA_ANNOUNCEMENTS[index]}
        </p>
      </div>
    </section>
  );
}
