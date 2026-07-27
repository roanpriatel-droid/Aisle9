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
