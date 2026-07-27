import {useEffect, type RefObject} from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap keyboard focus inside an overlay while it's active, and restore focus to
 * whatever was focused before it opened once it closes. Makes modal surfaces
 * (drawers, dialogs, lightboxes) keyboard- and screen-reader-safe: Tab / Shift+Tab
 * cycle within the container instead of leaking into the hidden page behind.
 *
 * The container should have tabIndex={-1} so it can receive focus when it has no
 * focusable children yet.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Move focus into the overlay (first control, else the container).
    const first = focusables()[0];
    (first ?? container).focus?.();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === firstEl || activeEl === container)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    const ac = new AbortController();
    document.addEventListener('keydown', onKeyDown, {signal: ac.signal});

    return () => {
      ac.abort();
      // Restore focus to the trigger, if it's still in the document.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus?.();
      }
    };
  }, [active, containerRef]);
}
