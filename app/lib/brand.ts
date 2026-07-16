/**
 * AISLE 9 — single source of truth for brand copy, nav, pricing ladder,
 * and store-swappable handles.
 *
 * The visual system is locked by "Aisle 9 Brand Identity System.pdf" (repo
 * root/docs). Any visual decision defers to that document.
 *
 * When the real Shopify store + Printify catalog are connected
 * (`npx shopify hydrogen link`), update COLLECTIONS below to the real
 * collection handles — nothing else should need to change.
 */

export const BRAND = {
  name: 'AISLE 9',
  tagline: 'NOTHING YOU NEED.',
  /** Social handle shown in UGC section + footer. TODO: confirm final handle. */
  social: '@aisle9',
} as const;

/**
 * Collection handles, swappable for the real store.
 * mock.shop has no best-sellers/new-stock collections, so all point at the
 * full catalog until the real store is linked.
 */
export const COLLECTIONS = {
  shopAll: '/collections/all',
  bestSellers: '/collections/all', // TODO real store: /collections/best-sellers
  newStock: '/collections/all', // TODO real store: /collections/new-stock
} as const;

export const NAV = [
  {title: 'SHOP ALL', to: COLLECTIONS.shopAll},
  {title: 'BEST SELLERS', to: COLLECTIONS.bestSellers},
  {title: 'NEW STOCK', to: COLLECTIONS.newStock},
  {title: 'CONTACT', to: '/pages/contact'},
] as const;

/** Rotating PA announcements for the top bar. Deadpan. In character. */
export const PA_ANNOUNCEMENTS = [
  'ATTENTION SHOPPERS: FREE US SHIPPING OVER $100.',
  'ATTENTION SHOPPERS: BUY MORE, PAY LESS. DISCOUNT APPLIES ITSELF.',
  'ATTENTION SHOPPERS: NEW STOCK WEEKLY. NO OCCASION.',
] as const;

export const MARQUEE_ITEMS = [
  'BUY 2 SAVE 10%',
  'BUY 3 SAVE 20%',
  'BUY 4 SAVE 30%',
  'FREE US SHIPPING $100+',
  'NEW STOCK WEEKLY',
] as const;

/**
 * Bulk pricing ladder. UI only — checkout is honored by a Shopify automatic
 * discount (quantity price break / "Buy X get Y" tiers) configured in the
 * store admin. See README "Launch checklist".
 */
export const BASE_PRICE = 29;

export const LADDER = [
  {qty: 1, discountPct: 0, label: 'LIST PRICE'},
  {qty: 2, discountPct: 10, label: 'SAVE 10%'},
  {qty: 3, discountPct: 20, label: 'SAVE 20%'},
  {qty: 4, discountPct: 30, label: 'BEST DEAL', bestDeal: true},
] as const;

export function ladderMath(tier: (typeof LADDER)[number]) {
  const list = BASE_PRICE * tier.qty;
  const total = list * (1 - tier.discountPct / 100);
  return {
    perShirt: total / tier.qty,
    total,
    saved: list - total,
  };
}

export const POLICIES = [
  {title: '30-DAY RETURNS', detail: 'Changed your mind. Understandable.'},
  {title: 'FREE US SHIPPING $100+', detail: 'Spend enough, pay nothing extra.'},
  {title: 'SECURE CHECKOUT', detail: 'Handled by Shopify. Not by us.'},
  {title: '5–7 DAY DELIVERY', detail: 'Printed on demand. It takes a minute.'},
] as const;

/** In-character UI strings. The PA voice never winks. */
export const VOICE = {
  basket: 'BASKET',
  basketHeading: 'YOUR BASKET',
  emptyBasket: 'Nothing in your basket. Keep wandering.',
  keepShopping: 'KEEP WANDERING',
  notFoundHeading: 'THIS AISLE DOES NOT EXIST.',
  notFoundBody: 'Whatever you were looking for, it is not down here.',
  notFoundCta: 'RETURN TO FRONT OF STORE',
  emailHeading: 'PRICE CHECK.',
  emailSub: '10% off your first order. Announcements when new stock hits the shelf.',
  emailPlaceholder: 'YOUR EMAIL',
  emailCta: 'CHECK',
  emailSuccess: 'PRICE CHECK CONFIRMED. WATCH YOUR INBOX.',
  searchHeading: 'PRICE CHECK',
  menuHeading: 'DEPARTMENTS',
} as const;

export const FOOTER_SHOP_LINKS = [
  {title: 'SHOP ALL', to: COLLECTIONS.shopAll},
  {title: 'BEST SELLERS', to: COLLECTIONS.bestSellers},
  {title: 'NEW STOCK', to: COLLECTIONS.newStock},
  {title: 'SEARCH', to: '/search'},
] as const;

export const FOOTER_POLICY_LINKS = [
  {title: 'SHIPPING', to: '/policies/shipping-policy'},
  {title: 'RETURNS + REFUNDS', to: '/policies/refund-policy'},
  {title: 'PRIVACY', to: '/policies/privacy-policy'},
  {title: 'TERMS', to: '/policies/terms-of-service'},
  {title: 'CONTACT', to: '/pages/contact'},
] as const;
