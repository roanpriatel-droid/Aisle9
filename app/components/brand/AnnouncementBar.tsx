import {useEffect, useState} from 'react';
import {PA_ANNOUNCEMENTS} from '~/lib/brand';

/**
 * "ATTENTION SHOPPERS" PA bar. Ink background, linoleum text.
 * Rotates through announcements like an overhead speaker cycle.
 * No countdown timers. The PA never winks.
 */
export function AnnouncementBar() {
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
      6000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex h-9 items-center justify-center bg-ink px-3 text-center"
      role="status"
      aria-live="off"
    >
      <p className="label-type truncate text-linoleum">
        {PA_ANNOUNCEMENTS[index]}
      </p>
    </div>
  );
}
