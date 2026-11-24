# AISLE 9 — Nothing You Need.

Print-on-demand deadpan graphic tees. A big-box store that doesn't exist,
built on Shopify Hydrogen (React Router + Vite + Tailwind v4).

Brand system is locked by **"Aisle 9 Brand Identity System.pdf"** (to be
committed to repo root/docs) — defer to it for any visual decision. The brand
marks (aisle marker wordmark, clearance sticker, PA bar) are implemented as
final HTML/CSS lockups in `app/components/brand/`; if official SVG exports
land later, swap the component internals and keep their APIs.

## Where things live

- `app/lib/brand.ts` — single source for nav, PA announcements, marquee copy,
  pricing ladder, policies, and every in-voice UI string. Edit copy here, not
  in components.
- `app/components/brand/` — aisle marker, clearance sticker, PA announcement
  bar, marquee strip (all placeholder art).
- `app/components/home/` — homepage sections: Hero, TodaysStock, BulkLadder,
  CommentCards, SeenInStore, TrustBar, PriceCheck.
- `app/styles/tailwind.css` — design tokens (linoleum/fluorescent/signage/
  ink/tag, institutional type utilities).
- `app/styles/app.css` — reskin of skeleton classes (header, cart aside, PDP,
  grids) so inner pages match.

## Data: mock.shop locally unless `.env` is set

The catalog currently runs on [mock.shop](https://mock.shop) (no
`PUBLIC_STORE_DOMAIN` set). To point at the real store:

1. `npx shopify hydrogen link` (interactive) or set env vars
   (`PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, ...).
2. Update collection handles in `app/lib/brand.ts` (`COLLECTIONS`) —
   best-sellers / new-stock currently point at `/collections/all`.

## Store (live config — set up 2026-11-24)

Shopify store: `nibavt-pw.myshopify.com` · 375 products (all linked to Printify) ·
18 matching sets · · Hydrogen storefront "Aisle9" (Oxygen,
workflow `oxygen-deployment-1000186400.yml`) · catalog from the Printify shop
"Aisle9" (Gildan 5000 via Monster Digital, printed in Columbus, OH).

- **Products** are created by Printify (so orders route to print automatically).
  Edit titles/tags/descriptions in Printify and re-publish, or in Shopify.
  Every product carries exactly one themed aisle tag + `all-products`;
  matching pairs also carry `matching-sets`; store-themed shirts `store-classics`.
- **Collections**: 12 smart collections, one per aisle/department, filled by tag
  (best-sellers / new-arrivals = every `all-products` item, sorted). Handles
  match `AISLES` / `DEPARTMENTS` in `app/lib/brand.ts`.
- **Bulk ladder**: three automatic discounts (2+ −10%, 3+ −20%, 4+ −30%) that
  don't combine with each other, so Shopify applies the best tier.
- **Codes**: `SAVINGSCLUB10` (Savings Club, once per customer) and
  `TAGGEDINAISLE9` (UGC reward). Neither stacks with the ladder; the better wins.
- **Metafields** (`aisle9.*`): product `aisle_number`, `aisle`, `matching_set`,
  `pa_announcement`; collection `aisle_number`, `sign_blurb`.
- **Contact form** submissions → metaobject `aisle9_complaint`
  (Admin → Content → Metaobjects). Add a Shopify Flow "Metaobject created →
  send internal email" to get them in your inbox.
- **Savings Club / Price Check / Notify-me** → Shopify customers subscribed to
  email marketing, tagged `savings-club` / `restock-notify`.

### Required Oxygen environment variables (Hydrogen → Storefront → Environments)

| Name | Value | Notes |
|---|---|---|
| `PRIVATE_SHOPIFY_ADMIN_CLIENT_ID` | the custom app's client ID | mark **secret** |
| `PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET` | the custom app's client secret | mark **secret** |

Used only server-side (`app/lib/admin.server.ts`) to save email signups and
complaints. Without them the forms still respond, but nothing is saved.

## Launch checklist (admin-only — cannot be done via API)

- [ ] **US (and international) checkout — #1 blocker**: only Canadian buyers
      can currently purchase. The US market exists but has no inventory
      location, so every product reads 0 in stock for US shoppers. In
      Settings → Markets → United States, add the **Printify** location to the
      market's inventory/fulfillment locations (and check Settings → Shipping
      and delivery → Fulfillable inventory). Verify: a US cart stops warning
      "already sold out".
- [ ] **Store currency → USD** (Settings → Store details). Store is CAD; the
      site and catalog are priced as $36 USD. Must be done before the first order.
- [ ] **Hydrogen storefront public**: Hydrogen → Aisle9 → Storefront settings →
      Production environment URL privacy → Public.
- [ ] **Domain**: move `aisle9.store` / `www.aisle9.store` from Online Store to
      the Hydrogen storefront (Settings → Domains / Hydrogen → Domains).
- [ ] **Online Store password**: remove once the domain points at Hydrogen
      (Online Store → Preferences).
- [ ] **Payments**: activate Shopify Payments / PayPal (identity + bank).
- [ ] **Order confirmation copy** — "Cleanup on aisle 9. Your order is on the
      way." in Settings → Notifications (checkout is Shopify-hosted).
- [ ] **Sender email** `aisle9@stratosync.solutions` verified with SPF/DKIM.
- [ ] **Shopify Email welcome automation** (optional — the site already shows
      the code on signup).
- [ ] **Reviews / UGC** — wire a review platform; never fabricate ratings.
- [ ] **Rotate** the Printify API token and the app client secret after setup.

## Development

Node 22.x or 24.x.

```bash
npm install
npm run build     # production build
npm run dev       # NOTE: does not run on ARM64 boxes without workerd support
```

## Customer Account API (`/account`)

Follow steps 1–2 of
<https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
