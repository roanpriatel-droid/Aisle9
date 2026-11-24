import {useEffect, useRef, useState} from 'react';
import {useFetcher, useLocation} from 'react-router';
import {SAVINGS_CLUB} from '~/lib/brand';
import {useFocusTrap} from '~/lib/useFocusTrap';
import {
  SavingsClubCode,
  type SavingsClubResult,
} from '~/components/SavingsClubCode';

const SEEN_KEY = 'a9_club_prompt_seen';
const DELAY_MS = 15_000;
const SKIP_PATHS = /^\/(cart|account|checkouts?|discount)/;

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked → don't nag
  }
}
function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked */
  }
}

/**
 * Savings Club enrollment, delivered as a store PA announcement. Opens once
 * per visitor — after 15s on the floor or on exit intent (desktop) — never on
 * cart/account/checkout. Real offer: 10% off the first order (SAVINGSCLUB10).
 */
export function SavingsClubPopup() {
  const [open, setOpen] = useState(false);
  const {pathname} = useLocation();
  const fetcher = useFetcher<SavingsClubResult>();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);

  useEffect(() => {
    if (SKIP_PATHS.test(pathname) || readSeen()) return;
    const show = () => {
      if (readSeen()) return;
      markSeen();
      setOpen(true);
    };
    const timer = window.setTimeout(show, DELAY_MS);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener('mouseout', onLeave);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  const confirmed = fetcher.data?.ok;

  return (
    <div className="club-popup-overlay" role="presentation">
      <button
        aria-label="Close"
        className="club-popup-scrim"
        onClick={() => setOpen(false)}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-labelledby="club-popup-heading"
        aria-modal="true"
        className="club-popup"
        ref={ref}
        role="dialog"
        tabIndex={-1}
      >
        <button
          aria-label="Close"
          className="club-popup-close"
          onClick={() => setOpen(false)}
          type="button"
        >
          ×
        </button>
        <p className="label-type text-signage">ATTENTION SHOPPERS</p>
        <h2 id="club-popup-heading" className="sign-type mt-2 text-3xl">
          10% OFF YOUR FIRST ORDER.
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          Enroll in the Savings Club. It saves you nothing else and sends you
          email. The 10% is real.
        </p>
        {confirmed ? (
          <SavingsClubCode tone="light" />
        ) : (
          <fetcher.Form action="/?index" className="mt-5 flex" method="post">
            <label className="sr-only" htmlFor="club-popup-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="w-full border-2 border-ink bg-white px-3 py-3 text-base"
              id="club-popup-email"
              name="email"
              placeholder={SAVINGS_CLUB.placeholder}
              required
              type="email"
            />
            <button
              className="btn shrink-0"
              disabled={fetcher.state !== 'idle'}
              name="intent"
              type="submit"
              value="savings-club"
            >
              {SAVINGS_CLUB.cta}
            </button>
          </fetcher.Form>
        )}
        {fetcher.data?.error === 'invalid' && !confirmed && (
          <p className="label-type mt-2 text-signage" role="alert">
            {SAVINGS_CLUB.invalid}
          </p>
        )}
        <button
          className="label-type mt-4 text-ink/50 underline underline-offset-4"
          onClick={() => setOpen(false)}
          type="button"
        >
          NO THANKS, I PAY FULL PRICE
        </button>
      </div>
    </div>
  );
}
