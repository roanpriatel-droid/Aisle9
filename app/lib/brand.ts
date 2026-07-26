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
 * Store-swappable collection handles.
 *
 * These are best-guess kebab-case handles derived from the live smart
 * collection titles. If any 404s, correct the handle here (and in AISLES /
 * DEPARTMENTS below) — nothing else needs to change. Locally the storefront
 * runs on mock.shop (which has none of these), so empty aisles render the
 * in-voice OUT OF STOCK state; on Oxygen these resolve to the real store.
 */
export const COLLECTIONS = {
  shopAll: '/collections/all',
  bestSellers: '/collections/best-sellers',
  newStock: '/collections/new-arrivals',
} as const;

/**
 * THE AISLE DIRECTORY — the nine themed departments, numbered 1–9 (the store
 * is Aisle 9; nine aisles is the whole joint). Order is fixed: the breadcrumb
 * and mega-menu read the number straight off this list. `handle` is the
 * Shopify collection handle; `blurb` doubles as the fallback department
 * description when the collection has none. Titles stay deadpan, all caps.
 *
 * ⚠️ Best-guess handles. Verify against the live store; the ambiguous ones
 * are flagged. Correcting a handle here fixes the nav, homepage directory,
 * and breadcrumb at once.
 */
export const AISLES = [
  {
    n: 1,
    title: 'I ❤',
    handle: 'i-collection', // ⚠️ emoji stripped by Shopify; could be i-heart-collection / i-love-collection
    blurb: 'Devotion, printed plainly. You said it, we set it in Arial.',
  },
  {
    n: 2,
    title: 'DOWN BAD',
    handle: 'down-bad',
    blurb: 'For lapses in judgment you would like to wear in public.',
  },
  {
    n: 3,
    title: 'THE CONFESSIONS',
    handle: 'the-confessions',
    blurb: 'Admissions in cotton. No priest, no absolution, free shipping over $100.',
  },
  {
    n: 4,
    title: 'FREAK BEHAVIOR',
    handle: 'freak-behavior',
    blurb: 'Conduct unbecoming, sizes S–3XL. Reported by others, worn by you.',
  },
  {
    n: 5,
    title: 'WARNING LABELS',
    handle: 'warning-labels',
    blurb: 'Full disclosure, worn on the chest. Handle with the appropriate caution.',
  },
  {
    n: 6,
    title: 'MINOR CRIMES',
    handle: 'minor-crimes',
    blurb: 'Misdemeanors only. Nothing here rises to the level of a felony. Probably.',
  },
  {
    n: 7,
    title: 'LIVER DAMAGE',
    handle: 'liver-damage',
    blurb: 'Consequences of a good time, itemized. Drink responsibly, dress otherwise.',
  },
  {
    n: 8,
    title: 'TYPO’D',
    handle: 'typod', // ⚠️ apostrophe dropped by Shopify; could be typo-d
    blurb: 'Errors we kept on purpose. The mistake is the design. No refunds on irony.',
  },
  {
    n: 9,
    title: 'GIFTS FOR IDIOTS',
    handle: 'gifts-for-idiots',
    blurb: 'For the person who has everything and understands none of it.',
  },
] as const;

export type Aisle = (typeof AISLES)[number];

/**
 * FRONT OF STORE — the departments that aren't numbered aisles: the promoted
 * merchandising collections plus the full catalog. These head the mega-menu
 * and get their own breadcrumb label ("FRONT OF STORE").
 */
export const DEPARTMENTS = [
  {title: 'BEST SELLERS', handle: 'best-sellers', to: '/collections/best-sellers'},
  {title: 'NEW ARRIVALS', handle: 'new-arrivals', to: '/collections/new-arrivals'},
  {title: 'MATCHING SETS', handle: 'matching-sets', to: '/collections/matching-sets'},
  {title: 'ALL PRODUCTS', handle: 'all', to: '/collections/all'},
] as const;

/**
 * Given a collection handle, return its aisle/department signage label, e.g.
 * "AISLE 4 — FREAK BEHAVIOR" or "FRONT OF STORE — BEST SELLERS". Falls back to
 * a generic department label for unknown handles so the breadcrumb never breaks.
 */
export function aisleLabelForHandle(handle: string, title?: string): string {
  const aisle = AISLES.find((a) => a.handle === handle);
  if (aisle) return `AISLE ${aisle.n} — ${aisle.title}`;
  const dept = DEPARTMENTS.find((d) => d.handle === handle);
  if (dept) return `FRONT OF STORE — ${dept.title}`;
  return `DEPARTMENT — ${(title ?? handle).toUpperCase()}`;
}

/**
 * FREQUENTLY PAIRED — which collection to cross-sell from on a PDP, keyed by
 * the product's own collection handle. Deadpan logic: confessions go with bad
 * decisions, crimes go with their consequences. Falls back to best sellers.
 */
export const COLLECTION_PAIRS: Record<string, string> = {
  'i-collection': 'down-bad',
  'down-bad': 'the-confessions',
  'the-confessions': 'down-bad',
  'freak-behavior': 'warning-labels',
  'warning-labels': 'freak-behavior',
  'minor-crimes': 'liver-damage',
  'liver-damage': 'minor-crimes',
  typod: 'warning-labels',
  'gifts-for-idiots': 'best-sellers',
  'matching-sets': 'matching-sets',
};

export const PAIR_FALLBACK_HANDLE = 'best-sellers';

export const NAV = [
  {title: 'AISLES', to: COLLECTIONS.shopAll},
  {title: 'BEST SELLERS', to: COLLECTIONS.bestSellers},
  {title: 'MATCHING SETS', to: '/collections/matching-sets'},
  {title: 'ALL PRODUCTS', to: COLLECTIONS.shopAll},
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

/**
 * SAVINGS CLUB — the email-capture styled as a supermarket loyalty-card
 * application. The bit is that the club saves you nothing; the 10% first-order
 * code is the one real benefit, stated plainly so it isn't a lie.
 */
export const SAVINGS_CLUB = {
  eyebrow: 'MEMBER SERVICES',
  heading: 'SAVINGS CLUB',
  motto: 'SAVE NOTHING. RECEIVE EMAILS.',
  sub: 'Enroll in the AISLE 9 Savings Club. Membership is free, confers no status, and entitles you to email. New members get 10% off the first order — the only tangible benefit, and it is real.',
  perks: [
    '10% OFF FIRST ORDER (REAL)',
    'RESTOCK ANNOUNCEMENTS (FREQUENT)',
    'MEMBER PRICING: SAME AS EVERYONE (HONEST)',
  ],
  placeholder: 'EMAIL FOR CARD',
  cta: 'ENROLL',
  finePrint: 'No card is mailed. No points accrue. Unsubscribe ends membership immediately and without ceremony.',
  success: 'MEMBERSHIP ACTIVE. CHECK YOUR INBOX FOR THE CODE.',
  cardHolder: 'MEMBER SINCE TODAY',
} as const;

/** Gifts For Idiots — clearance banner copy (Aisle 9's end-of-store bin). */
export const GIFTS_BANNER = {
  aisleLabel: 'AISLE 9',
  heading: 'GIFTS FOR IDIOTS',
  sub: 'The endcap bin by the registers. For the person who has everything and understands none of it.',
  sticker: 'GIFTABLE',
  cta: 'RAID THE BIN',
  handle: 'gifts-for-idiots',
} as const;

/** Matching Sets — BOGO-style shelf-talker promo copy. */
export const MATCHING_SETS = {
  eyebrow: 'SHELF TALKER · AISLE FRONT',
  heading: 'MATCHING SETS',
  pitch: 'TWO SHIRTS. ONE BAD IDEA, SPLIT EVENLY.',
  sub: 'Coordinated pairs for people who insist on doing things together. Buy the set, hit the bulk ladder automatically, dress like a cautionary tale in stereo.',
  bogoLine: 'BUY THE PAIR · THE LADDER TAKES 10% OFF · IT APPLIES ITSELF',
  cta: 'SHOP THE SETS',
  to: '/collections/matching-sets',
} as const;

/**
 * Size chart — single source shared by the size-guide page and the PDP size
 * chart modal. Unisex heavyweight staple tee, laid flat, inches. Verify
 * against the final Printify blank before launch.
 */
export const SIZE_CHART = [
  {size: 'S', chest: 18, length: 28, sleeve: 8.25},
  {size: 'M', chest: 20, length: 29, sleeve: 8.63},
  {size: 'L', chest: 22, length: 30, sleeve: 9},
  {size: 'XL', chest: 24, length: 31, sleeve: 9.38},
  {size: '2XL', chest: 26, length: 32, sleeve: 9.75},
  {size: '3XL', chest: 28, length: 33, sleeve: 10.13},
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
  menuHeading: 'STORE DIRECTORY',
  /** Collection with zero products (in stock again later). */
  outOfStockHeading: 'OUT OF STOCK (TEMPORARILY)',
  outOfStockBody:
    'This aisle is between shipments. The shelf is real, it is simply empty. Check back, or wander to a stocked department.',
  /** Filtered to nothing. */
  noMatchHeading: 'NO UNITS MATCH THAT FILTER.',
  noMatchBody: 'Loosen the filter and the shelf refills.',
  clearFilters: 'CLEAR ALL FILTERS',
  /** PDP cross-sell. */
  pairedHeading: 'FREQUENTLY PAIRED',
  pairedSub: 'Bought together by people making a series of decisions.',
  /** Cart upsell slot. */
  cartUpsellHeading: 'CUSTOMERS ALSO REGRETTED',
  cartUpsellSub: 'Add one more. The ladder rewards poor impulse control.',
  cartUpsellCta: 'SEE THE BEST SELLERS',
  /** 404 for a missing product/page. */
  notFoundItemHeading: 'ITEM NOT FOUND — CHECK AISLE 9',
  notFoundItemBody:
    'Whatever you scanned did not ring up. It may be discontinued, mis-shelved, or something you imagined. Aisle 9 is where lost items end up.',
} as const;

/** Production facts shown on the PDP and FAQ. Keep truthful. */
export const PRODUCTION = {
  method: 'PRINTED ON DEMAND',
  turnaround: 'SHIPS IN 5–7 BUSINESS DAYS',
  returns: '30-DAY RETURNS',
  blank: 'HEAVYWEIGHT UNISEX COTTON TEE · S–3XL',
} as const;

export const FOOTER_SHOP_LINKS = [
  {title: 'SHOP ALL', to: COLLECTIONS.shopAll},
  {title: 'BEST SELLERS', to: COLLECTIONS.bestSellers},
  {title: 'NEW STOCK', to: COLLECTIONS.newStock},
  {title: 'SEARCH', to: '/search'},
] as const;

export const FOOTER_INFO_LINKS = [
  {title: 'ABOUT THE STORE', to: '/pages/about'},
  {title: 'QUESTIONS', to: '/pages/faq'},
  {title: 'SIZE GUIDE', to: '/pages/size-guide'},
  {title: 'CUSTOMER SERVICE', to: '/pages/contact'},
] as const;

export const FOOTER_POLICY_LINKS = [
  {title: 'SHIPPING', to: '/policies/shipping-policy'},
  {title: 'RETURNS + REFUNDS', to: '/policies/refund-policy'},
  {title: 'PRIVACY', to: '/policies/privacy-policy'},
  {title: 'TERMS', to: '/policies/terms-of-service'},
] as const;
