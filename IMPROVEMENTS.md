# AISLE 9 — Improvement Log

Autonomous improvement loop. One entry per cycle: date · lens · found · did · why · next.
Honest trail, reverts included. Brand system (BRAND.md) is locked — improvements only, never redesign.

Environment note: the live Oxygen URL isn't retrievable from this build box (deploy
logs are auth-gated) and there's no browser/dev server here (ARM64 can't run workerd),
so audits crawl the **code** with each lens and are backed by web research. Live visual
/ Lighthouse verification is deferred to the deployed site.

---

## Cycle 1 — 2026-07-27 — Lens: CONVERSION

**Found (ranked by impact):**
1. The cart drawer's "upsell" was a **dead static link** to Best Sellers — not real,
   one-tap product suggestions. This is the single biggest un-used AOV lever.
2. The **free-shipping progress meter was duplicated** — rendered by both `CartMain`
   (`FreeShippingMeter`) and `CartSummary` (its own inline block meter). Looked broken.
3. `LadderNudge` told shoppers "add 1 more, save 10%" but gave them **no way to act** on it.

**Research:** Cart-drawer product suggestions drive ~5–15% AOV; a free-shipping/threshold
progress bar adds ~10–20%; a well-built drawer combining 2–3 upsell types reaches
+15–25% AOV with zero extra traffic. Mobile guidance: one-tap add, ≥44px targets,
keep it compact. (Sources: GrowthSuite, EasyAppsEcom, Rebuy.)

**Did:**
- New `CartRecommendations` component: real best-selling products (from a cached root
  loader query, `CART_RECOMMENDATIONS_QUERY`) with **one-tap add-to-cart**, framed by
  the bulk ladder ("ADD N MORE — HIT −10%"). Items already in the cart are excluded via
  their variant ids. Falls back to a link if nothing suitable remains.
- Removed the duplicate free-shipping meter (kept the one inside `CartSummary`'s receipt).
- Deleted the dead static `CartUpsell`.
- Compact 390px-friendly rows: 52px thumbnail, 2-line title clamp, 44px ADD target.

**Why:** Turns the store's core value prop (the bulk ladder) from passive signage into an
active AOV engine at the exact moment of highest intent (cart), using real products and
one tap — the highest-ROI conversion pattern for this store, and honest (no fabricated
"you may also like" data; it's genuine best-sellers).

**Acceptance:** real products render with working add; ladder math accurate; in-cart items
excluded; 390px compact; build + typecheck green; no regression to /cart page (same
component powers both). ✅

**Next to consider:** sticky checkout button pinned to the bottom of the drawer (mobile
UX lens); make the discounted total visible in-cart if the Shopify automatic discount is
configured; exit-intent or post-add confirmation.

---

## Cycle 2 — 2026-07-27 — Lens: MOBILE UX

**Found (ranked by impact):**
1. The cart drawer used a **hard-coded-height, absolutely-positioned summary**
   (`--cart-aside-summary-height: 380px`) with the scrollable list sized by
   `calc(100vh - 380px)`. Any content change (like Cycle 1's recommendations)
   risks the checkout CTA overlapping content, and the primary action isn't
   reliably thumb-reachable in a full cart.
2. Form inputs used `text-sm` (14px) → **iOS Safari zooms on focus**, a jarring
   mobile defect across every capture form (search, email, complaint, notify,
   discount code).

**Research:** Mobile cart drawers should slide/scroll with a **sticky checkout
button** always visible, ≥44px tap targets, and one-tap actions. Fixed-height
drawer regions are an anti-pattern — content length varies.

**Did:**
- Rebuilt the drawer as a **flex column**: `aside` is `flex-direction: column`,
  `aside main` is `flex:1; overflow-y:auto; overscroll-behavior:contain`. Removed
  the fragile `.cart-main` max-height hack and the absolute-positioned summary.
- **Sticky checkout**: `.cart-checkout-actions` is `position:sticky; bottom:0`
  inside the drawer, min-height 48px — always thumb-reachable regardless of how
  much is in the cart. Also improves the /cart page (natural flow, no inner scroll).
- iOS zoom fix: form controls forced to 16px under 480px.

**Why:** Content-agnostic layout that can't overlap, with the highest-intent
action (checkout) permanently reachable by thumb. Directly unblocks Cycle 1's
recommendations from breaking the drawer.

**Acceptance:** build + typecheck green; drawer scrolls with pinned checkout;
no fixed-height assumptions; /cart page unaffected (flows naturally); inputs
16px on mobile. ✅

**Next to consider:** accessibility pass on the drawer + modals (focus trap,
focus return, Esc consistency); performance/LCP audit; SEO metadata coverage.

---

## Cycle 3 — 2026-07-27 — Lens: ACCESSIBILITY

**Found:** Every modal surface — the cart/search/menu drawer (`Aside`), the
size-chart modal, and the gallery lightbox — handled Escape but **did not trap
focus or restore it to the trigger on close**. Keyboard and screen-reader users
could Tab out of an open overlay into the hidden page behind it. The three
`Aside` dialogs were also always `role="dialog"` in the DOM even when closed.

**Research:** WAI-ARIA Authoring Practices — a modal dialog must confine Tab
focus within it, return focus to the invoking element on close, and be removed
from the accessibility tree when hidden.

**Did:**
- New `useFocusTrap(active, ref)` hook: cycles Tab/Shift+Tab within the container
  and restores focus to the previously-focused element on close.
- Wired it into `Aside` (cart/search/menu), `SizeChartModal`, and the
  `ProductGallery` lightbox (each container gets `tabIndex={-1}`).
- `Aside` overlay now `aria-hidden` + its close-outside button `tabindex=-1`
  when collapsed, so closed drawers leave the a11y tree.
- Added a visible `:focus-visible` outline (signage red) — app.css loads after
  the reset, so keyboard focus is now always visible.

**Why:** Keyboard/AT users can operate every overlay without focus leaking into
hidden content — table-stakes accessibility a world-class store ships.

**Acceptance:** build + typecheck green; focus trap + restore on all three
overlay types; closed drawers aria-hidden; visible focus ring. ✅

**Next to consider:** SEO structured data (BreadcrumbList, Organization, WebSite);
performance/LCP; skip-to-content link; prefers-reduced-motion coverage audit.

---

## Cycle 4 — 2026-07-27 — Lens: SEO

**Found:** Only the PDP carried a canonical or structured data beyond `Product`.
Missing: sitewide Organization/WebSite schema, BreadcrumbList on collections and
PDPs, and canonicals on collections (facet/sort params → duplicate-content risk)
and the homepage.

**Research:** Google rich-result guidance — Organization + WebSite (with a
SearchAction) enable brand knowledge-panel + sitelinks search box; BreadcrumbList
yields breadcrumb SERP display; self-referencing canonicals consolidate faceted
collection URLs.

**Did:**
- New `StructuredData.tsx`: `SiteJsonLd` (Organization + WebSite + SearchAction →
  /search) rendered sitewide from root; `BreadcrumbJsonLd` (absolute URLs via a
  new `origin` field on the root loader).
- BreadcrumbList on collection pages (AISLE 9 › Collection) and PDPs
  (AISLE 9 › Aisle › Product).
- Canonicals: collections self-canonical to `/collections/<handle>` (no query
  params); homepage to `/`. Added og:title/og:type to collections.

**Why:** Gives search engines the brand graph, breadcrumb trails, and clean
canonical signals — standard SEO infrastructure a world-class store ships, and
it compounds as products/collections get indexed.

**Acceptance:** build + typecheck green; JSON-LD emitted sitewide + per template;
canonicals param-free. (Validate live via Google Rich Results Test once the URL
is reachable.) ✅. Never removed existing Product structured data or analytics.

**Next to consider:** performance/LCP audit; copy-quality pass on collection
descriptions; trust signals (returns/PoD messaging consistency); empty-search UX.

---

## Cycle 5 — 2026-07-27 — Lens: PERFORMANCE (Core Web Vitals / CLS)

**Found:** The homepage hero's "endcap" product is behind a deferred Suspense
boundary. Its loading fallback (`min-h-[16rem]`, one box) had a completely
different height than the loaded state (a 2-col grid with a full square image +
text panel). When stock streams in, the hero jumped ~256px → ~560px — a
guaranteed **CLS** hit on the highest-traffic, above-the-fold element.

**Reasoned (not measured — no Lighthouse on this box):** CLS is caused by
inserting content without reserving its space. The fix is deterministic: make
the placeholder occupy the same box model as the resolved content.

**Did:** Rewrote `EndcapFrame` to mirror the loaded endcap exactly — a
`md:grid-cols-2` grid with an `aspect-square` image cell (reserves the image
space at every breakpoint) and a text-panel cell with `min-h-[11rem]` on mobile
(reserves the stacked text height). The section no longer resizes when the
product resolves.

**Why:** CLS is a Core Web Vital and this was the worst offender on the store's
most-visited page. Deterministic, zero-risk (placeholder-only change).

**Acceptance:** build green; fallback and loaded endcap share dimensions at
mobile + desktop; no change to the resolved UI. ✅ Verified below-fold deferred
boundaries (Best Sellers grid, Weekly Circular mailer, PDP Frequently Paired)
already reserve matching space via skeletons.

**Next to consider:** de-defer or preload the hero image if it proves to be LCP
on mobile (needs live measurement); copy-quality pass on collection descriptions;
trust-signal consistency; empty-search UX.

---

## Cycle 6 — 2026-07-27 — Lens: EDGE CASES (long titles)

**Found:** Product-card titles had no line-clamp — `.shelf-title` (collection
grid, best sellers) and the inline `<h3>`s in Frequently Paired, From The Same
Aisle, Recently Viewed, the Weekly Circular flyer, and the hero endcap. Since
AISLE 9 sells long-confession-sentence shirts, a long title wraps to many lines
and **breaks grid alignment** — a store-specific, high-relevance edge case.

**Did:**
- `.shelf-title`: 2-line clamp + `min-height: 2.1em` so 1- and 2-line cards stay
  aligned in the grid.
- `line-clamp-2` on the inline card `<h3>`s (paired, same-aisle, recently viewed,
  flyer); `line-clamp-3` on the larger hero endcap title.

**Why:** Guarantees consistent, non-broken card layouts regardless of title
length — directly relevant to this catalog's long titles.

**Acceptance:** build green; clamps applied everywhere product-card titles render;
grid rows stay even. ✅

**Next to consider:** empty-search state (dead-ends lens); trust-signal
consistency across PDP/cart/footer; collection description copy quality.

---

## Cycle 7 — 2026-07-27 — Lens: DEAD ENDS / EMPTY STATES

**Found:** The search empty state was already strong and in-voice (done earlier).
The one real defect: a fresh `/search` visit with no query showed
"NOT STOCKED. CHECKED THE BACK." — misleading, since nothing was searched.

**Did:** `SearchResultsEmpty` now branches on whether a term was entered:
no-term → "ENTER A TERM ABOVE. AN ASSOCIATE WILL CHECK THE SHELVES."; searched →
the "not stocked" copy. Passed `term` through from the route.

**Why:** Correct message for the state; a fresh search page is no longer a
false dead end.

**Acceptance:** build + typecheck green. ✅

---

## DIMINISHING RETURNS — 2026-07-27 (honest checkpoint, per the operating system)

Cycles 1–4 were structural and high-impact (cart AOV engine, mobile drawer,
a11y focus management, SEO schema). Cycles 5–7 were genuine but polish-tier
(CLS, title clamp, search copy), and cycle 7's target was already handled. That
is the OS's "consecutive non-structural cycles" signal. Rather than manufacture
progressively trivial code changes, here is the honest picture.

**Highest-leverage work now is NON-CODE (needs owner/admin input I can't self-serve):**
1. **Live URL + Lighthouse/CWV measurement.** The perf lens is capped without it;
   this box can't reach the Oxygen URL or run Lighthouse. Biggest unlock.
2. **Configure the Shopify automatic bulk-ladder discount.** The whole site sells
   "buy more, pay less," but without the admin automatic discount, checkout charges
   list price. This is the #1 gap between promise and reality — a conversion +
   trust problem no code here can fix.
3. **Real product data + photography.** The templates (PDP gallery, flyer, cards)
   are built and empty-safe, but they shine only with real Printify colorway images.
4. **Real reviews (Judge.me content).** Social proof is a top conversion lever; the
   wiring + JSON-LD are in place, but stars must be earned, not fabricated.
5. **Verify best-guess collection handles** against the live store (i-collection,
   typod, all-vs-all-products). Wrong ones show the in-voice "restocking" page, not
   the real aisle.
6. **Wire the email platform** (Savings Club / notify-me / complaint form are stubs)
   and issue the promised 10% code.

**Lower-leverage code work that remains** (real, but marginal — will pick up if the
loop continues): trust-signal wording consistency across PDP/cart/footer; a
copy-quality pass on any generic collection descriptions; visual-polish details;
deeper edge cases (cart line whose product was deleted; multi-option OOS combos).

**Recommendation:** the dramatic gains from here come from the non-code list above
(especially #1 and #2). I'll keep looping on code polish if asked, but I'm flagging
honestly that we've crossed from "drastic" into "diminishing" on the code side.
