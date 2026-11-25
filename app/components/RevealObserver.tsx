import {useEffect} from 'react';
import {useLocation} from 'react-router';

/**
 * Fades [data-reveal] blocks up as they scroll into view. Marks <html> with
 * `js` on mount so the hidden starting state only ever applies when this
 * observer is actually running (no-JS and crawlers see everything).
 */
export function RevealObserver() {
  const {pathname} = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    if (!('IntersectionObserver' in window)) {
      document
        .querySelectorAll('[data-reveal]')
        .forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.08},
    );
    const observeAll = () =>
      document
        .querySelectorAll('[data-reveal]:not(.is-revealed)')
        .forEach((el) => io.observe(el));
    observeAll();
    // Deferred (Suspense) content streams in later — observe it too.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, {childList: true, subtree: true});
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
