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
 * FRONT OF STORE — the promoted merchandising collections plus the full
 * catalog. Numbered 10–13 so the directory sign can show ALL 13 collections as
 * numbered aisles, while nav still treats these as front-of-store quick links.
 */
export const DEPARTMENTS = [
  {n: 10, title: 'BEST SELLERS', handle: 'best-sellers', to: '/collections/best-sellers', blurb: 'What everyone else already regretted. Moves fast.'},
  {n: 11, title: 'NEW ARRIVALS', handle: 'new-arrivals', to: '/collections/new-arrivals', blurb: 'Freshly shelved. No occasion. Restocked weekly.'},
  {n: 12, title: 'MATCHING SETS', handle: 'matching-sets', to: '/collections/matching-sets', blurb: 'Two shirts, one bad idea, split evenly. Ladder applies.'},
  {n: 13, title: 'ALL PRODUCTS', handle: 'all', to: '/collections/all', blurb: 'The entire store, aisle by aisle. Everything we have.'},
] as const;

/**
 * ALL 13 COLLECTIONS as numbered aisles — the store directory. Aisles 1–9 are
 * the themed departments; 10–13 are front of store. Used by the homepage
 * directory sign, the footer aisles column, and breadcrumb labelling.
 */
export const ALL_AISLES = [
  ...AISLES.map((a) => ({...a, kind: 'aisle' as const})),
  ...DEPARTMENTS.map((d) => ({
    n: d.n,
    title: d.title,
    handle: d.handle,
    blurb: d.blurb,
    kind: 'department' as const,
  })),
] as const;

/**
 * Given a collection handle, return its numbered signage label, e.g.
 * "AISLE 4 — FREAK BEHAVIOR". Falls back to a generic department label for
 * unknown handles so the breadcrumb never breaks.
 */
export function aisleLabelForHandle(handle: string, title?: string): string {
  const aisle = ALL_AISLES.find((a) => a.handle === handle);
  if (aisle) return `AISLE ${aisle.n} — ${aisle.title}`;
  return `DEPARTMENT — ${(title ?? handle).toUpperCase()}`;
}

/** Look up a known aisle/department by handle (for resilient collection pages). */
export function findAisle(handle: string) {
  return ALL_AISLES.find((a) => a.handle === handle) ?? null;
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

/** Free US shipping threshold (USD). Drives the announcement bar + cart receipt. */
export const FREE_SHIPPING_THRESHOLD = 100;

/** Rotating top announcement bar. Deadpan. In character. */
export const ANNOUNCEMENT_BAR = [
  'NOTHING YOU NEED. EVERYTHING WE HAVE.',
  `FREE US SHIPPING OVER $${FREE_SHIPPING_THRESHOLD}.`,
  'NEW DROPS WEEKLY. NO OCCASION.',
] as const;

/**
 * In-store PA quote strip — overhead-speaker announcements that rotate on the
 * homepage. Longer, deadpan, never winking. Kept separate from the top bar.
 */
export const PA_ANNOUNCEMENTS = [
  'ATTENTION SHOPPERS: FREE US SHIPPING OVER $100.',
  'ATTENTION SHOPPERS: BUY MORE, PAY LESS. THE DISCOUNT APPLIES ITSELF.',
  'ATTENTION SHOPPERS: NEW STOCK WEEKLY. NO OCCASION.',
  'CLEANUP ON AISLE 9. AGAIN.',
  'THE OWNER OF A LIFE LEFT UNEXAMINED, PLEASE RETURN TO AISLE 3.',
  'ATTENTION SHOPPERS: EVERY SHIRT IS $36. NOBODY REMEMBERS WHY.',
  'WILL THE CUSTOMER WHO KNOWS WHAT THEY WANT PLEASE REPORT TO ANY REGISTER.',
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
export const BASE_PRICE = 36;

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
  /** Recently viewed. */
  previouslyScanned: 'PREVIOUSLY SCANNED',
  previouslyScannedSub: 'Items you have already looked at. We kept the receipt.',
  /** Quick add on grids. */
  quickAdd: 'QUICK ADD',
  quickAdding: 'ADDING…',
  quickAdded: 'IN BASKET ✓',
  pickSize: 'PICK A SIZE',
  /** Inventory urgency signage. */
  inStockSuffix: 'UNITS. FOR NOW.',
  /** Cart / receipt. */
  freeShipEarned: 'FREE SHIPPING UNLOCKED. TREAT YOURSELF FURTHER.',
  freeShipRemaining: 'TO FREE US SHIPPING',
  cartTrustRow: [
    'SECURE CHECKOUT BY SHOPIFY',
    '30-DAY RETURNS',
    'PRINTED ON DEMAND',
  ],
  /** Aisle temporarily unstocked (known handle, no products / not resolved). */
  restockingHeading: 'AISLE TEMPORARILY CLOSED FOR RESTOCKING',
  restockingBody:
    'This department is real and will be stocked shortly. The sign stays up. Wander another aisle in the meantime.',
} as const;

/** Production facts shown on the PDP and FAQ. Keep truthful. */
export const PRODUCTION = {
  method: 'PRINTED ON DEMAND',
  turnaround: 'SHIPS IN 5–7 BUSINESS DAYS',
  returns: '30-DAY RETURNS',
  blank: 'HEAVYWEIGHT UNISEX COTTON TEE · S–3XL',
} as const;

/**
 * FAT FOOTER — four columns. Aisles lists all 13; Service Desk and Corporate
 * cover the standalone pages; the legal bar sits along the bottom. Every link
 * resolves to a real route.
 */
export const FOOTER_AISLES = ALL_AISLES.map((a) => ({
  title: a.title,
  to: `/collections/${a.handle}`,
}));

export const FOOTER_SERVICE = [
  {title: 'CUSTOMER SERVICE DESK', to: '/pages/faq'},
  {title: 'SHIPPING & RECEIVING', to: '/pages/shipping'},
  {title: 'SIZING DEPARTMENT', to: '/pages/size-guide'},
  {title: 'CONTACT / COMPLAINTS', to: '/pages/contact'},
  {title: 'CAREERS', to: '/pages/careers'},
] as const;

export const FOOTER_CORPORATE = [
  {title: 'STORE INFORMATION', to: '/pages/about'},
  {title: 'WEEKLY CIRCULAR', to: '/pages/weekly-circular'},
  {title: 'ALL DEPARTMENTS', to: '/collections'},
  {title: 'SEARCH THE SHELVES', to: '/search'},
  {title: 'YOUR ACCOUNT', to: '/account'},
] as const;

export const FOOTER_LEGAL = [
  {title: 'PRIVACY', to: '/policies/privacy-policy'},
  {title: 'TERMS', to: '/policies/terms-of-service'},
  {title: 'REFUNDS', to: '/policies/refund-policy'},
  {title: 'SHIPPING POLICY', to: '/policies/shipping-policy'},
] as const;

/** Payment methods shown in the footer (rendered as institutional chips). */
export const PAYMENT_METHODS = [
  'VISA',
  'MASTERCARD',
  'AMEX',
  'DISCOVER',
  'SHOP PAY',
  'PAYPAL',
  'G PAY',
  'APPLE PAY',
] as const;

/* ============================================================
 * STANDALONE PAGE COPY — every string deadpan, all caps where
 * it's signage, sentence case in body prose. Never winks.
 * ============================================================ */

/** STORE INFORMATION — the About page as a corporate-policy document. */
export const STORE_INFO = {
  eyebrow: 'CORPORATE · DOCUMENT 09',
  heading: 'STORE INFORMATION',
  effective: 'EFFECTIVE: THE MOMENT YOU ARRIVED',
  mission: {
    title: 'MISSION STATEMENT',
    body: 'AISLE 9 exists to provide shoppers with garments that meet or exceed the expectation that they will be garments. We are committed to leveraging cotton to deliver value-adjacent experiences across the apparel vertical, end to end, at scale, in sizes S through 3XL. Our mission is ongoing, unfalsifiable, and subject to change without notice.',
  },
  values: [
    {title: 'INTEGRITY', body: 'The shirt will be the shirt shown. This is the entire promise.'},
    {title: 'SYNERGY', body: 'Two shirts cost less per shirt than one shirt costs per shirt. This is mathematics, which we call synergy.'},
    {title: 'TRANSPARENCY', body: 'Every shirt is $36. We do not know why. We have stopped asking.'},
    {title: 'SUSTAINABILITY', body: 'Nothing is printed until you order it, so we maintain a warehouse of zero regrets and one printer.'},
  ],
  orgTitle: 'ORGANIZATIONAL CHART',
  orgNote: 'AISLE 9 maintains a flat management structure.',
  org: [
    {role: 'FOUNDER & CEO', name: 'MANAGEMENT'},
    {role: 'HEAD OF OPERATIONS', name: 'MANAGEMENT'},
    {role: 'CHIEF SHELF OFFICER', name: 'MANAGEMENT'},
    {role: 'CUSTODIAL (AISLE 9)', name: 'MANAGEMENT'},
    {role: 'INTERN', name: 'ALSO MANAGEMENT'},
  ],
  facts: [
    {k: 'ESTABLISHED', v: 'RECENTLY'},
    {k: 'HEADQUARTERS', v: 'AISLE 9'},
    {k: 'EMPLOYEES', v: '1 (SEE ORG CHART)'},
    {k: 'ANNUAL FOOT TRAFFIC', v: 'YOU, JUST NOW'},
    {k: 'RETURN POLICY', v: '30 DAYS'},
    {k: 'DRESS CODE', v: 'OUR SHIRTS, IDEALLY'},
  ],
  statement:
    'AISLE 9 is a store that does not exist selling shirts that do. That distinction is the whole business model. Everything else on this page is filler, formatted to look official, which is itself a kind of honesty.',
} as const;

/** CAREERS — free brand, one line. */
export const CAREERS = {
  eyebrow: 'HUMAN RESOURCES',
  heading: 'CAREERS',
  line: 'We are not hiring.',
  signoff: '— MANAGEMENT',
  sub: 'The position of "everyone" is currently filled. Applications are not retained, reviewed, or acknowledged. Thank you for your interest in AISLE 9.',
} as const;

/** CONTACT — the customer-complaint form. */
export const CONTACT = {
  eyebrow: 'CUSTOMER RELATIONS',
  heading: 'FILE A COMPLAINT',
  sub: 'Use the form below to submit a complaint, compliment, or statement. All submissions are read in the order received.',
  responseTime: 'ESTIMATED RESPONSE TIME: EVENTUALLY',
  natures: [
    'MY ORDER',
    'A SIZING DISPUTE',
    'EVERYTHING IS $36',
    'A SHIRT SAID SOMETHING TRUE',
    'GENERAL GRIEVANCE',
    'A COMPLIMENT (RARE)',
    'OTHER',
  ],
  severity: ['MILD', 'MODERATE', 'SEVERE', 'EXISTENTIAL'],
  emailLabel: 'YOUR EMAIL',
  orderLabel: 'ORDER NUMBER (IF ANY)',
  natureLabel: 'NATURE OF COMPLAINT',
  severityLabel: 'SEVERITY',
  bodyLabel: 'STATE YOUR COMPLAINT',
  bodyPlaceholder: 'Begin. We are, in a manner of speaking, listening.',
  submit: 'SUBMIT TO THE DESK',
  success: 'COMPLAINT LOGGED. TICKET FILED UNDER "NOTED." RESPONSE TIME: EVENTUALLY.',
  deskEmail: 'complaints@aisle9.store',
  deskNote: 'Prefer email? The desk also reads',
} as const;

/** SHIPPING & RECEIVING. */
export const SHIPPING = {
  eyebrow: 'LOGISTICS · DOCK 9',
  heading: 'SHIPPING & RECEIVING',
  sub: 'How the shirt gets to you, and how it gets back if it must. Printed on demand, so there is a short delay while your specific shirt is made because of a decision you specifically made.',
  sections: [
    {
      title: 'PROCESSING',
      body: 'Every shirt is printed after you order it. Printing takes 2–5 business days. Nothing is sitting in a warehouse waiting; it does not exist until you commit to it.',
    },
    {
      title: 'TRANSIT',
      body: 'Once printed, most US orders arrive within 5–7 business days. A tracking number is issued when the parcel leaves the facility. The parcel does not require encouragement.',
    },
    {
      title: 'RATES',
      body: 'Shipping is calculated at checkout by weight and destination. US orders over $100 ship free — achievable, given the bulk ladder, if you commit.',
    },
    {
      title: 'RECEIVING (RETURNS)',
      body: 'Changed your mind within 30 days? Understandable. Unworn, unwashed, returned to the desk. Refunds go to the original payment method once the shirt is inspected by someone who takes it more seriously than it deserves.',
    },
    {
      title: 'DAMAGED OR MISPRINTED',
      body: 'Send a photo to the Customer Service Desk within 30 days. A replacement is printed at no charge. The photo is required. The apology is implied.',
    },
  ],
} as const;

/**
 * CUSTOMER SERVICE DESK — the FAQ as a numbered policy accordion. Real answers.
 * (Migrated from the old FAQ page so both stay in one place.)
 */
export const SERVICE_DESK = {
  eyebrow: 'POSTED AT THE SERVICE DESK',
  heading: 'CUSTOMER SERVICE DESK',
  sub: 'Policies and answers, numbered for reference. Read in the order received.',
  items: [
    {q: 'HOW DOES THE BULK DISCOUNT WORK?', a: 'Put shirts in your basket. Two shirts take 10% off, three take 20% off, four or more take 30% off. It applies automatically at checkout — no code, and you can mix and match any designs. The math happens whether or not you notice it.'},
    {q: 'WHEN WILL MY ORDER SHIP?', a: 'Every shirt is printed after you order it. Printing takes 2–5 business days, then transit. Most US orders arrive within 5–7 business days of printing. You will get a tracking number when it leaves the facility.'},
    {q: 'HOW MUCH IS SHIPPING?', a: 'Calculated at checkout by weight and destination. US orders over $100 ship free, which — given the bulk ladder — is achievable if you commit.'},
    {q: 'WHAT ARE THE SHIRTS LIKE?', a: 'Heavyweight unisex cotton tees, printed with water-based inks. Sizes S through 3XL. Colorways vary by design — generally white, black, and ash grey. See the Sizing Department before guessing.'},
    {q: 'CAN I RETURN A SHIRT?', a: 'Yes. 30 days from delivery, unworn and unwashed. Start at the Customer Service Desk (the contact page). Refunds go back to the original payment method once the shirt is inspected.'},
    {q: 'MY SHIRT ARRIVED DAMAGED OR MISPRINTED.', a: 'Not technically a question, but understood. Send a photo of the problem to customer service within 30 days and a replacement will be printed at no charge. The photo is required. The apology is implied.'},
    {q: 'HOW DO I WASH IT?', a: 'Inside out, cold water, mild detergent. Hang dry or tumble low. Do not iron the print. Treated properly, the shirt will outlast the phase of your life it describes.'},
    {q: 'DO YOU RESTOCK?', a: 'New designs shelve weekly. Because everything is printed to order, designs do not "sell out" — but they do get discontinued without ceremony. If you are attached to one, act like it.'},
    {q: 'IS THE STORE REAL?', a: 'The shirts are real. The prices are real. The store is a concept. If you have further questions about the nature of retail, the Customer Service Desk will read them in the order received.'},
  ],
} as const;

/** WEEKLY CIRCULAR — the signature lookbook / supermarket flyer. */
export const WEEKLY_CIRCULAR = {
  eyebrow: 'THIS WEEK ONLY · WHILE SUPPLIES CONCEPTUALLY LAST',
  heading: 'WEEKLY CIRCULAR',
  sub: 'The AISLE 9 flyer. Everything below is available now, priced at $36, and subject to the bulk ladder the moment a second shirt joins the first.',
  validity: 'PRICES VALID: THIS WEEK, LAST WEEK, PROBABLY NEXT WEEK',
  disclaimer:
    'No rain checks. No substitutions we would not have made anyway. Prices as marked. The bulk discount applies itself at checkout.',
  teaser: {
    eyebrow: 'NOW IN CIRCULATION',
    heading: 'THIS WEEK’S CIRCULAR',
    sub: 'The full flyer: every department, laid out with price tags, like the mailer nobody asked for.',
    cta: 'READ THE CIRCULAR',
  },
} as const;

/** FREAK BEHAVIOR — the "employees only" beaded-curtain gag on the homepage. */
export const FREAK_BEHAVIOR = {
  sign: 'EMPLOYEES ONLY',
  heading: 'FREAK BEHAVIOR',
  sub: 'Aisle 4. Past the beaded curtain, behind the mop bucket. Conduct unbecoming, sizes S–3XL. Enter at your own reputation.',
  cta: 'PART THE CURTAIN',
  handle: 'freak-behavior',
} as const;

/**
 * BRANDED POLICY FALLBACKS — used by /policies/$handle when the Shopify shop
 * policy is empty, so the legal links always resolve with in-voice content.
 * bodyHtml is rendered through the .a9-prose container.
 */
export const POLICY_FALLBACKS: Record<
  string,
  {title: string; eyebrow: string; bodyHtml: string}
> = {
  'privacy-policy': {
    title: 'PRIVACY POLICY',
    eyebrow: 'FILED WITH THE OFFICE OF THE STORE MANAGER',
    bodyHtml: `
      <p>AISLE 9 collects the information required to sell you a shirt and ship it: your name, address, email, and the contents of your basket. We collect it because a shirt cannot be mailed to a concept.</p>
      <h2>WHAT WE COLLECT</h2>
      <ul><li>Order and contact details you provide at checkout.</li><li>Standard technical data (browser, device, pages viewed) via cookies and analytics.</li><li>Your email, if you enroll in the Savings Club, which saves you nothing but sends you email.</li></ul>
      <h2>HOW WE USE IT</h2>
      <p>To process orders, prevent fraud, provide support, and — with consent — send restock announcements. We do not sell your personal information. We would not know how.</p>
      <h2>PROCESSORS</h2>
      <p>Checkout and payments are handled by Shopify. Printing and fulfilment are handled by our print partner. These processors receive only what they need to do their jobs.</p>
      <h2>YOUR RIGHTS</h2>
      <p>You may request access to, correction of, or deletion of your data by writing to the Customer Service Desk. Unsubscribing from email ends your Savings Club membership immediately and without ceremony.</p>
      <p><em>This policy is provided in the store's voice and does not constitute legal advice. Confirm final legal terms with counsel before launch.</em></p>
    `,
  },
  'refund-policy': {
    title: 'RETURNS & REFUNDS',
    eyebrow: 'POSTED AT THE RETURNS DESK',
    bodyHtml: `
      <p>Changed your mind. Understandable. You have 30 days from delivery to return an unworn, unwashed shirt for a refund to the original payment method.</p>
      <h2>HOW TO RETURN</h2>
      <ul><li>Start at the Customer Service Desk (the contact page) with your order number.</li><li>Return the shirt unworn and unwashed, with any tags.</li><li>Once inspected, your refund is issued to the original payment method.</li></ul>
      <h2>DAMAGED OR MISPRINTED</h2>
      <p>Send a photo to the Customer Service Desk within 30 days. A replacement is printed at no charge — no need to return the original. The photo is required. The apology is implied.</p>
      <h2>PRINTED ON DEMAND</h2>
      <p>Because each shirt is made to order, we cannot accept returns for a change in personality, only a change of mind. Sale and clearance items follow the same 30-day window.</p>
    `,
  },
  'terms-of-service': {
    title: 'TERMS OF SERVICE',
    eyebrow: 'THE FINE PRINT, SET IN ARIAL',
    bodyHtml: `
      <p>By using this store you agree to buy shirts under the following terms, which are ordinary and, where possible, boring.</p>
      <h2>ORDERS</h2>
      <p>Placing an order is an offer to purchase. We may decline or cancel an order for reasons including stock, pricing errors, or suspected fraud. Prices are as marked.</p>
      <h2>THE BULK LADDER</h2>
      <p>Quantity discounts (2 tees −10%, 3 −20%, 4+ −30%) are applied automatically at checkout and cannot be combined with certain promotions. The ladder is the promotion.</p>
      <h2>INTELLECTUAL PROPERTY</h2>
      <p>The designs, wordmarks, and this website's content belong to AISLE 9. The shirt is yours once you buy it; the joke remains ours.</p>
      <h2>LIMITATION OF LIABILITY</h2>
      <p>AISLE 9 is not liable for indirect or consequential damages, including any social consequence of wearing a shirt that admits something true. Wear at your own reputation.</p>
      <h2>CHECKOUT</h2>
      <p>Payment and order processing are handled by Shopify under its terms. Governing law and venue will be finalized before launch.</p>
      <p><em>Provided in the store's voice; not legal advice. Confirm final terms with counsel.</em></p>
    `,
  },
  'shipping-policy': {
    title: 'SHIPPING POLICY',
    eyebrow: 'LOGISTICS · DOCK 9',
    bodyHtml: `
      <p>Every shirt is printed after you order it. Printing takes 2–5 business days; most US orders then arrive within 5–7 business days. A tracking number is issued when the parcel leaves the facility.</p>
      <h2>RATES</h2>
      <p>Shipping is calculated at checkout by weight and destination. US orders over $100 ship free.</p>
      <h2>WHERE WE SHIP</h2>
      <p>United States and select international destinations, as offered at checkout. Duties and taxes for international orders are the recipient's responsibility.</p>
      <p>Full details, including returns, live in <a href="/pages/shipping">Shipping &amp; Receiving</a>.</p>
    `,
  },
};
