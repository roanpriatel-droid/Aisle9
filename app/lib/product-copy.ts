/**
 * AISLE 9 — per-product copy, generated from the product title.
 *
 * Every PDP shows an in-voice description built from three parts:
 *   1. announcement — a one-line PA about the item, referencing the title.
 *   2. specs        — the spec sheet as deadpan inventory data.
 *   3. care         — care instructions phrased as store policy.
 * (+ an optional disclosure line for flavor.)
 *
 * The generator (`describeProduct`) is title-aware so nothing reads generic.
 * Three archetypes are HAND-TUNED below and used as the reference examples;
 * the generator applies the same pattern to every other title.
 *
 * ── HAND-TUNED EXAMPLES ──────────────────────────────────────────────
 *  A) SHORT (the "I'M STUPID" class):        "I'M STUPID"
 *  B) LONG confession:  "I KEEP MAKING THE SAME MISTAKE AND CALLING IT GROWTH"
 *  C) MATCHING-SET member:                    "HIS BAD IDEA"
 * ─────────────────────────────────────────────────────────────────────
 */

export type ProductCopy = {
  announcement: string;
  specs: string[];
  care: string[];
  disclosure: string;
};

/** Shared, fixed policy lines — the store's care policy, not the product's. */
const CARE: string[] = [
  'MACHINE WASH COLD, INSIDE OUT.',
  'TUMBLE DRY LOW OR HANG. DO NOT IRON THE PRINT.',
  'DO NOT DRY CLEAN A T-SHIRT. NOBODY INVOLVED WOULD RESPECT IT.',
  'AISLE 9 IS NOT RESPONSIBLE FOR SHRINKAGE OF ANY KIND.',
];

/** Baseline inventory spec block (deadpan). */
const BASE_SPECS: string[] = [
  'MATERIAL: COTTON.',
  'WEIGHT: SUFFICIENT.',
  'FIT: BOX-ADJACENT.',
  'INK: WATER-BASED, OPINIONATED.',
  'SIZES: S–3XL.',
  'ORIGIN: PRINTED TO ORDER, USA.',
];

function norm(title: string): string {
  return title.trim().toLowerCase().replace(/[‘’']/g, "'");
}

/** Three hand-tuned references (see header). Keyed by normalized title. */
const OVERRIDES: Record<string, ProductCopy> = {
  "i'm stupid": {
    announcement: 'ATTENTION SHOPPERS: THIS SHIRT SAYS WHAT IT SAYS.',
    specs: [
      'MATERIAL: COTTON.',
      'WEIGHT: SUFFICIENT.',
      'FIT: BOX-ADJACENT.',
      'STATEMENT: TWO WORDS. NO NOTES.',
      'SIZES: S–3XL.',
      'ORIGIN: PRINTED TO ORDER, USA.',
    ],
    care: CARE,
    disclosure:
      'DISCLOSURE: THE SHIRT MAKES NO CLAIM ABOUT THE WEARER. THE WEARER MAKES THE CLAIM.',
  },
  'i keep making the same mistake and calling it growth': {
    announcement:
      'ATTENTION SHOPPERS: A FULL SENTENCE IS NOW AVAILABLE IN AISLE 3.',
    specs: [
      'MATERIAL: COTTON.',
      'WEIGHT: SUFFICIENT.',
      'FIT: BOX-ADJACENT.',
      'STATEMENT: LONG. UNRESOLVED. ACCURATE.',
      'READING TIME: LONGER THAN THE RELATIONSHIP.',
      'SIZES: S–3XL. ORIGIN: PRINTED TO ORDER, USA.',
    ],
    care: CARE,
    disclosure:
      'DISCLOSURE: WEARING THIS DOES NOT CONSTITUTE GROWTH. IT CONSTITUTES A SHIRT.',
  },
  'his bad idea': {
    announcement:
      'ATTENTION SHOPPERS: ONE HALF OF A MATCHING SET. THE OTHER HALF IS SOMEWHERE IN AISLE 12.',
    specs: [
      'MATERIAL: COTTON.',
      'WEIGHT: SUFFICIENT.',
      'FIT: BOX-ADJACENT.',
      'SET: SOLD SEPARATELY. REGRET SHARED.',
      'SIZES: S–3XL.',
      'ORIGIN: PRINTED TO ORDER, USA.',
    ],
    care: CARE,
    disclosure:
      'DISCLOSURE: MATCHING IS OPTIONAL. THE BAD IDEA IS NOT. THE LADDER STILL APPLIES.',
  },
};

/**
 * Generate the in-voice copy for any product title. Uses a hand-tuned override
 * when one exists; otherwise builds a title-specific PA line + spec sheet.
 */
export function describeProduct(title: string): ProductCopy {
  const override = OVERRIDES[norm(title)];
  if (override) return override;

  const upper = title.trim().toUpperCase();
  const words = title.trim().split(/\s+/).length;

  // The PA line is always about THIS item — never generic.
  const announcement =
    words <= 3
      ? `ATTENTION SHOPPERS: “${upper}”. THAT IS THE ENTIRE SHIRT.`
      : `ATTENTION SHOPPERS: A SHIRT READING “${upper}” IS NOW ON THE SHELF.`;

  const statementSpec =
    words <= 3
      ? 'STATEMENT: BRIEF. LOAD-BEARING.'
      : 'STATEMENT: A COMPLETE THOUGHT, PRINTED IN FULL.';

  const specs = [...BASE_SPECS];
  specs.splice(3, 0, statementSpec);

  return {
    announcement,
    specs,
    care: CARE,
    disclosure: `DISCLOSURE: THIS SHIRT SAYS “${upper}”. IT WILL CONTINUE TO SAY THAT.`,
  };
}
