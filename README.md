# AISLE 9 — Nothing You Need.

Print-on-demand deadpan graphic tees. A big-box store that doesn't exist,
built on Shopify Hydrogen (React Router + Vite + Tailwind v4).

Brand system is locked by **"Aisle 9 Brand Identity System.pdf"** (repo
root/docs) — defer to it for any visual decision. Placeholder logo components
live in `app/components/brand/` and should be swapped for the committed SVGs
(aisle marker wordmark, clearance sticker, shelf talker, PA bar).

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

## Data: mock.shop now, real store later

The catalog currently runs on [mock.shop](https://mock.shop) (no
`PUBLIC_STORE_DOMAIN` set). To point at the real store:

1. `npx shopify hydrogen link` (interactive) or set env vars
   (`PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, ...).
2. Update collection handles in `app/lib/brand.ts` (`COLLECTIONS`) —
   best-sellers / new-stock currently point at `/collections/all`.

## Launch checklist (things the UI promises that admin must honor)

- [ ] **Bulk pricing ladder** — the site advertises 1 tee $29 / 2 −10% /
      3 −20% / 4 −30%, auto-applied, mix-and-match. This REQUIRES a Shopify
      **automatic discount** with quantity tiers in the store admin (or a
      Function-based discount). Without it, checkout will charge list price.
      Ladder copy lives in `app/lib/brand.ts` (`LADDER`, `BASE_PRICE`).
- [ ] **Price Check email capture** — the homepage form posts to a stub
      action in `app/routes/_index.tsx` that discards the address. Wire to
      Shopify Email / Klaviyo before launch, including the promised 10% first
      order code.
- [ ] **Order confirmation copy** — "Cleanup on aisle 9. Your order is on the
      way." goes in Shopify admin → Settings → Notifications (checkout is
      Shopify-hosted; not controlled by this repo).
- [ ] **Contact page** — `app/routes/pages.contact.tsx` has a placeholder
      support email + social handle.
- [ ] **Reviews / UGC** — CommentCards and SeenInStore render honest empty /
      placeholder states. Wire a review platform and real photos when they
      exist. Do not fabricate counts or ratings.
- [ ] **Free US shipping over $100** — configure the shipping rate in admin.
- [ ] Swap placeholder brand components for the committed SVGs.

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
