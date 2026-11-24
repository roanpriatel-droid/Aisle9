import {useEffect, useState} from 'react';
import {ANNOUNCEMENT_BAR as BASE_MESSAGES, HOLIDAY_CUTOFF} from '~/lib/brand';

/** Holiday order-by notice leads the rotation until the cutoff passes. */
const ANNOUNCEMENT_BAR: readonly string[] =
  Date.now() < Date.parse(HOLIDAY_CUTOFF.orderBy)
    ? [`ATTENTION SHOPPERS: ${HOLIDAY_CUTOFF.label}.`, ...BASE_MESSAGES]
    : BASE_MESSAGES;

/**
 * "ATTENTION SHOPPERS" PA bar. Ink background, linoleum text.
 * Rotates through announcements like an overhead speaker cycle.
 * No countdown timers. The PA never winks.
 */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ANNOUNCEMENT_BAR.length < 2) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ANNOUNCEMENT_BAR.length),
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
        {ANNOUNCEMENT_BAR[index]}
      </p>
    </div>
  );
}
