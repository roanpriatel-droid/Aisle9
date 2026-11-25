import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.gift-guide';
import {
  BASE_PRICE,
  GIFT_DEPARTMENTS,
  HOLIDAY_CUTOFF,
  LADDER,
  ladderMath,
} from '~/lib/brand';
import {seoMeta} from '~/lib/seo';
import {BreadcrumbJsonLd} from '~/components/StructuredData';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return seoMeta({
    matches,
    title: data?.seo?.title || 'Funny Gift Guide — Gifts Under $40 | AISLE 9',
    fullTitle: true,
    description: data?.seo?.description,
    path: '/pages/gift-guide',
  });
};

type Faq = {q: string; a: string}[];

export async function loader({context}: Route.LoaderArgs) {
  const {page} = await context.storefront.query(GIFT_GUIDE_QUERY);
  let faq: Faq = [];
  try {
    const parsed = JSON.parse(page?.faq?.value ?? '[]') as Array<
      Partial<{q: unknown; a: unknown}>
    >;
    faq = parsed.filter(
      (f): f is {q: string; a: string} =>
        typeof f?.q === 'string' && typeof f?.a === 'string',
    );
  } catch {
    faq = [];
  }
  return {
    heading: page?.title ?? 'THE GIFT DEPARTMENT',
    bodyHtml: page?.body ?? '',
    seo: page?.seo ?? null,
    faq,
    beforeCutoff: Date.now() < Date.parse(HOLIDAY_CUTOFF.orderBy),
  };
}

export default function GiftGuide() {
  const {heading, bodyHtml, faq, beforeCutoff} = useLoaderData<typeof loader>();

  // Receipt-style budget cards: the real ladder math, not a promise.
  const budgets = [
    {
      qty: 1,
      total: BASE_PRICE,
      perShirt: BASE_PRICE,
      note: 'ONE SHIRT. ONE PERSON.',
    },
    ...LADDER.filter((t) => t.qty > 1).map((tier) => {
      const m = ladderMath(tier);
      return {
        qty: tier.qty,
        total: m.total,
        perShirt: m.perShirt,
        note: `${tier.label} · APPLIES ITSELF`,
      };
    }),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="label-type text-ink/50">
        <Link className="hover:text-signage" to="/">
          AISLE 9
        </Link>
        {' / '}
        <span className="text-ink">GIFT DEPARTMENT</span>
      </nav>

      <header className="mt-4 grid gap-6 border-b-2 border-ink pb-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="label-type text-signage">SEASONAL · SERVICE DESK</p>
          <h1 className="sign-type mt-1 text-4xl sm:text-5xl">{heading}</h1>
          {bodyHtml ? (
            <div
              className="mt-4 max-w-2xl space-y-3 text-ink/75"
              // Merchant-authored HTML from the Shopify page body.

              dangerouslySetInnerHTML={{__html: bodyHtml}}
            />
          ) : null}
        </div>
        {beforeCutoff && (
          <Link
            to="#departments"
            className="block border-2 border-ink bg-signage p-5 text-white! no-underline shadow-[6px_6px_0_0_var(--color-ink)]"
          >
            <p className="label-type text-white/80">ATTENTION SHOPPERS</p>
            <p className="sign-type mt-1 text-2xl">{HOLIDAY_CUTOFF.label}</p>
            <p className="mt-2 text-sm text-white/85">
              Every shirt is printed after you order it. Plan accordingly.
            </p>
          </Link>
        )}
      </header>

      {/* Shop by budget — receipt cards */}
      <section aria-labelledby="budget-heading" className="mt-12">
        <p className="label-type text-ink/50">SHOP BY BUDGET</p>
        <h2 id="budget-heading" className="sign-type mt-1 text-3xl">
          WHAT IT COSTS, ITEMIZED
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {budgets.map((b) => (
            <li key={b.qty}>
              <Link
                to="/collections/best-sellers"
                prefetch="intent"
                className="receipt-card block h-full border-2 border-dashed border-ink bg-white p-5 font-mono no-underline hover:bg-fluorescent"
              >
                <p className="label-type text-ink/50">RECEIPT #{b.qty}</p>
                <p className="mt-3 flex justify-between text-sm">
                  <span>{b.qty} × SHIRT</span>
                  <span>${b.perShirt.toFixed(2)}</span>
                </p>
                <p className="mt-2 flex justify-between border-t-2 border-dashed border-ink pt-2 text-lg font-bold">
                  <span>TOTAL</span>
                  <span>${b.total.toFixed(2)}</span>
                </p>
                <p className="label-type mt-3 text-signage">{b.note}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop by recipient / occasion */}
      <section
        id="departments"
        aria-labelledby="dept-heading"
        className="mt-14 scroll-mt-24"
      >
        <p className="label-type text-ink/50">SHOP BY RECIPIENT</p>
        <h2 id="dept-heading" className="sign-type mt-1 text-3xl">
          WHO IS THIS FOR, ROUGHLY
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GIFT_DEPARTMENTS.map((d) => (
            <li key={d.handle}>
              <Link
                to={`/collections/${d.handle}`}
                prefetch="intent"
                className="group flex h-full flex-col justify-between gap-6 border-2 border-ink bg-white p-5 no-underline transition-shadow hover:shadow-[6px_6px_0_0_var(--color-ink)]"
              >
                <span>
                  <span className="sign-type block text-xl group-hover:text-signage">
                    {d.title}
                  </span>
                  <span className="mt-2 block text-sm text-ink/70">
                    {d.line}
                  </span>
                </span>
                <span className="label-type text-ink/50">SHOP THE AISLE →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {faq.length > 0 && (
        <section aria-labelledby="gift-faq" className="mt-14 max-w-3xl">
          <p className="label-type text-ink/50">CUSTOMER SERVICE DESK</p>
          <h2 id="gift-faq" className="sign-type mt-1 text-3xl">
            GIFTING QUESTIONS
          </h2>
          <div className="mt-4 divide-y-2 divide-ink border-2 border-ink bg-white">
            {faq.map((item) => (
              <details key={item.q} className="group p-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="text-signage transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink/75">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <BreadcrumbJsonLd
        items={[
          {name: 'AISLE 9', path: '/'},
          {name: 'Gift Department', path: '/pages/gift-guide'},
        ]}
      />
    </div>
  );
}

const GIFT_GUIDE_QUERY = `#graphql
  query GiftGuidePage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: "gift-guide") {
      title
      body
      seo { title description }
      faq: metafield(namespace: "aisle9", key: "faq") { value }
    }
  }
` as const;
