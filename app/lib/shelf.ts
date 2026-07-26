import type {RecommendedProductFragment} from 'storefrontapi.generated';

/**
 * Which collection a homepage shelf's products actually came from, after the
 * best-sellers → new-arrivals → catalog fallback. Surfaced honestly in the UI
 * (e.g. "SHOWING NEW ARRIVALS") so the sign never lies about the shelf.
 */
export type ShelfSource = 'best-sellers' | 'new-arrivals' | 'catalog';

export type ShelfData = {
  source: ShelfSource;
  products: RecommendedProductFragment[];
};
