import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {VOICE} from '~/lib/brand';

const KEY = 'a9:previously-scanned';
const MAX = 8;

export type ScannedItem = {
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  amount: string;
  currencyCode: string;
};

function read(): ScannedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScannedItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Record a product as "scanned". Call once per PDP view. Dedupes by handle,
 * newest first, capped at MAX. Client-only (localStorage).
 */
export function useTrackScanned(item: ScannedItem | null) {
  useEffect(() => {
    if (!item?.handle) return;
    try {
      const existing = read().filter((p) => p.handle !== item.handle);
      const next = [item, ...existing].slice(0, MAX);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode) — silently skip.
    }
  }, [item?.handle]);
}

/**
 * PREVIOUSLY SCANNED — the recently-viewed rail. Renders nothing on the server
 * and nothing when there's no history (or only the current item), so it never
 * ships an empty section.
 */
export function RecentlyViewed({excludeHandle}: {excludeHandle?: string}) {
  const [items, setItems] = useState<ScannedItem[]>([]);

  useEffect(() => {
    setItems(read().filter((p) => p.handle !== excludeHandle));
  }, [excludeHandle]);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="scanned-heading"
      className="col-span-full mt-14 border-t-2 border-ink pt-10"
    >
      <p className="label-type text-ink/50">{VOICE.previouslyScannedSub}</p>
      <h2 id="scanned-heading" className="sign-type mt-1 text-3xl">
        {VOICE.previouslyScanned}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <Link
            key={p.handle}
            to={`/products/${p.handle}`}
            prefetch="intent"
            className="group block border-2 border-ink bg-white no-underline"
          >
            {p.imageUrl && (
              <div className="border-b-2 border-ink">
                <img
                  src={p.imageUrl}
                  alt={p.imageAlt || p.title}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="sign-type line-clamp-2 text-sm group-hover:text-signage">
                {p.title}
              </h3>
              <span className="mt-1 flex items-baseline gap-1 text-sm font-bold">
                <Money
                  data={{
                    amount: p.amount,
                    currencyCode: p.currencyCode as CurrencyCode,
                  }}
                />
                <span className="label-type text-ink/40">EACH</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
