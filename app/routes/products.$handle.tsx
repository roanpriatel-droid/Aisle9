import {Suspense, useMemo, useState} from 'react';
import {
  Await,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  CartForm,
  Image,
  Money,
  ShopPayButton,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {PriceTag} from '~/components/PriceTag';
import {ProductGallery, type GalleryImage} from '~/components/ProductGallery';
import {AddToCartButton} from '~/components/AddToCartButton';
import {SizeChartModal} from '~/components/SizeChartModal';
import {RecentlyViewed, useTrackScanned} from '~/components/RecentlyViewed';
import {
  JudgeMeReviews,
  JudgeMeBadge,
  ProductJsonLd,
  type VariantOffer,
} from '~/components/Reviews';
import {BreadcrumbJsonLd} from '~/components/StructuredData';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {describeProduct} from '~/lib/product-copy';
import {
  COLLECTIONS,
  TAG_PAIRS,
  TAG_TO_HANDLE,
  primaryAisleTag,
  LADDER,
  PRODUCTION,
  SIZE_CHART,
  VOICE,
  aisleLabelForHandle,
} from '~/lib/brand';
import type {
  ProductFragment,
  PairedProductFragment,
} from 'storefrontapi.generated';

type SiblingData = {handle: string; title: string; products: PairedProductFragment[]};

/** "ITEM #A9-0217" from the product GID. Deterministic, stable. */
function itemNumber(productId: string): string {
  const digits = (productId.match(/\d+/g)?.join('') ?? '').slice(-4).padStart(4, '0');
  return `A9-${digits}`;
}

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const title = product?.title ?? '';
  const description =
    product?.seo?.description ||
    (title ? describeProduct(title).announcement : '') ||
    `${title} — a deadpan graphic tee, printed on demand at AISLE 9.`;
  const image = data?.previewImageUrl;

  return [
    {title: `AISLE 9 — ${title}`},
    {name: 'description', content: description},
    {property: 'og:title', content: `AISLE 9 — ${title}`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'product'},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {rel: 'canonical', href: `/products/${product?.handle}`},
    // LCP preload for the main gallery image.
    ...(image
      ? [{tagName: 'link', rel: 'preload', as: 'image', href: image} as const]
      : []),
  ];
};

/** Notify-me / restock capture (stub until email platform is wired). */
export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get('intent') === 'notify') return {ok: true};
  return {ok: false};
}

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(args, criticalData.product);
  return {...criticalData, ...deferredData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  redirectIfHandleIsLocalized(request, {handle, data: product});

  // Preview image for OG + LCP preload.
  const previewImageUrl =
    product.selectedOrFirstAvailableVariant?.image?.url ??
    product.images?.nodes?.[0]?.url ??
    undefined;

  return {product, previewImageUrl};
}

/** FREQUENTLY PAIRED (paired collection) + FROM THE SAME AISLE (own collection). */
function loadDeferredData({context}: Route.LoaderArgs, product: ProductFragment) {
  // Products are organized by TAG (the themed collections don't exist), so both
  // cross-sell rails key off the product's own aisle tag.
  const tags = (product.tags ?? []) as string[];
  const myTag = primaryAisleTag(tags);
  const pairedTag = myTag ? TAG_PAIRS[myTag] : null;

  const byTag = (tag: string | null) =>
    tag
      ? context.storefront
          .query(PRODUCTS_BY_TAG_QUERY, {variables: {query: `tag:'${tag}'`}})
          .then((res) => ({
            handle: TAG_TO_HANDLE[tag] ?? '',
            title: '',
            products: (res.products?.nodes ?? [])
              .filter((p) => p.handle !== product.handle)
              .slice(0, 4),
          }))
          .catch(() => ({handle: '', title: '', products: []}))
      : Promise.resolve({handle: '', title: '', products: []});

  return {paired: byTag(pairedTag), siblings: byTag(myTag)};
}

export default function Product() {
  const {product, paired, siblings} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title} = product;
  const copy = useMemo(() => describeProduct(title), [title]);
  const itemNo = itemNumber(product.id);

  // The product's aisle comes from its tags (themed collections don't exist).
  const aisleHandle = useMemo(() => {
    const tag = primaryAisleTag((product.tags ?? []) as string[]);
    return tag ? TAG_TO_HANDLE[tag] ?? null : null;
  }, [product.tags]);
  const aisleLabel = aisleHandle ? aisleLabelForHandle(aisleHandle) : 'THE SHELF';
  const aisleTo = aisleHandle ? `/collections/${aisleHandle}` : COLLECTIONS.shopAll;

  const available = selectedVariant?.availableForSale ?? false;
  const numericProductId = product.id.split('/').pop() ?? product.id;

  // Size gate — force an explicit size choice before add (spec requirement).
  const sizeOption = productOptions.find((o) => /size/i.test(o.name));
  const hasSize = Boolean(sizeOption && sizeOption.optionValues.length > 1);
  const [sizeChosen, setSizeChosen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const needsSize = hasSize && !sizeChosen;

  function requireSize() {
    setSizeError(true);
    if (typeof document !== 'undefined') {
      document
        .getElementById('pdp-size')
        ?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  // All product images for the gallery (variant image drives the main frame).
  const galleryImages: GalleryImage[] = product.images?.nodes ?? [];

  // Per-variant offers for structured data (from each option value's variant).
  const offers = useMemo<VariantOffer[]>(() => {
    const seen = new Set<string>();
    const out: VariantOffer[] = [];
    for (const opt of product.options ?? []) {
      for (const v of opt.optionValues ?? []) {
        const fv = v.firstSelectableVariant;
        if (!fv?.price) continue;
        const key = `${fv.price.amount}-${fv.sku ?? ''}-${fv.availableForSale}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          price: fv.price.amount,
          currencyCode: fv.price.currencyCode,
          available: fv.availableForSale,
          sku: fv.sku ?? undefined,
          name: fv.title ?? undefined,
        });
      }
    }
    return out;
  }, [product.options]);

  useTrackScanned({
    handle: product.handle,
    title: product.title,
    imageUrl: selectedVariant?.image?.url ?? galleryImages[0]?.url,
    imageAlt: selectedVariant?.image?.altText ?? product.title,
    amount:
      selectedVariant?.price?.amount ??
      product.priceRange?.minVariantPrice?.amount ??
      '0',
    currencyCode:
      selectedVariant?.price?.currencyCode ??
      product.priceRange?.minVariantPrice?.currencyCode ??
      'USD',
  });

  return (
    <div className="product pb-28 md:pb-0">
      <ProductGallery
        images={galleryImages}
        selectedImage={selectedVariant?.image}
        title={title}
      />

      <div className="product-main">
        {/* 1 — breadcrumb + item number */}
        <nav aria-label="Breadcrumb" className="label-type text-ink/50">
          <Link className="hover:text-signage" to="/">
            AISLE 9
          </Link>
          {' / '}
          <Link className="hover:text-signage" to={aisleTo}>
            {aisleLabel}
          </Link>
          <span className="text-ink/30"> / {itemNo}</span>
        </nav>

        {/* 2 — title, scaled per length */}
        <h1 className={`pdp-title ${titleScaleClass(title)}`}>{title}</h1>

        {/* PA announcement — the item's one-line pitch */}
        <p className="pdp-pa">{copy.announcement}</p>

        {/* 3 — review stars slot (hidden until Judge.me populates) */}
        <div className="mt-3">
          <JudgeMeBadge productId={numericProductId} />
        </div>

        {/* 4 — price tag */}
        <div className="mt-5">
          <PriceTag
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>

        {/* 5–8 — options, add-to-cart, express (or OOS state) */}
        <BuyControls
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          available={available}
          sizeChosen={sizeChosen}
          needsSize={needsSize}
          onSizeChosen={() => {
            setSizeChosen(true);
            setSizeError(false);
          }}
          sizeError={sizeError}
          onRequireSize={requireSize}
        />

        {/* bulk ladder shelf-edge */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-2 border-ink bg-fluorescent px-4 py-2.5">
          <span className="label-type text-signage">BUY MORE, PAY LESS</span>
          <span className="label-type text-ink">
            {LADDER.filter((t) => t.discountPct > 0)
              .map((t) => `${t.qty} −${t.discountPct}%`)
              .join(' · ')}
          </span>
          <span className="label-type text-ink/50">APPLIES ITSELF</span>
        </div>

        {/* 9 — trust row as compliance notices */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {COMPLIANCE.map((c) => (
            <div key={c} className="border-2 border-ink bg-white p-2 text-center">
              <span className="label-type text-ink/70">{c}</span>
            </div>
          ))}
        </div>

        {/* 10 — accordion */}
        <ProductAccordion copy={copy} />
      </div>

      {/* Below the fold */}
      <FrequentlyPaired paired={paired} current={product} variant={selectedVariant} />
      <FromTheSameAisle siblings={siblings} />
      <RecentlyViewed excludeHandle={product.handle} />
      <JudgeMeReviews productId={numericProductId} productTitle={title} />
      <CheckoutDivider />

      <StickyBuyBar
        title={title}
        price={selectedVariant?.price}
        available={available}
        needsSize={needsSize}
        variant={selectedVariant}
        onRequireSize={requireSize}
      />

      <ProductJsonLd
        title={product.title}
        description={copy.announcement}
        image={selectedVariant?.image?.url ?? galleryImages[0]?.url}
        url={`/products/${product.handle}`}
        currencyCode={selectedVariant?.price?.currencyCode}
        available={available}
        offers={offers}
      />

      <BreadcrumbJsonLd
        items={[
          {name: 'AISLE 9', path: '/'},
          ...(aisleHandle
            ? [{name: aisleLabel, path: `/collections/${aisleHandle}`}]
            : []),
          {name: product.title, path: `/products/${product.handle}`},
        ]}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/** Title scale: short titles get huge, long confessions dial down cleanly. */
function titleScaleClass(title: string): string {
  const len = title.length;
  if (len <= 14) return 'pdp-title-xl';
  if (len <= 34) return 'pdp-title-lg';
  return 'pdp-title-md';
}

const COMPLIANCE = [
  'RETURNS ACCEPTED. QUESTIONS AVOIDED.',
  'PRINTED IN USA',
  'SECURE CHECKOUT',
] as const;

/* ─────────────────────────── Buy controls ─────────────────────────── */

function BuyControls({
  productOptions,
  selectedVariant,
  available,
  sizeChosen,
  needsSize,
  onSizeChosen,
  sizeError,
  onRequireSize,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  available: boolean;
  sizeChosen: boolean;
  needsSize: boolean;
  onSizeChosen: () => void;
  sizeError: boolean;
  onRequireSize: () => void;
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  const colorOption = productOptions.find((o) => /colou?r|colorway/i.test(o.name));
  const sizeOption = productOptions.find((o) => /size/i.test(o.name));
  const otherOptions = productOptions.filter(
    (o) => o !== colorOption && o !== sizeOption && o.optionValues.length > 1,
  );

  function pick(variantUriQuery: string, isSize: boolean) {
    if (isSize) onSizeChosen();
    void navigate(`?${variantUriQuery}`, {replace: true, preventScrollReset: true});
  }

  return (
    <div className="mt-6">
      {/* 5 — colorway swatches, labeled like inventory */}
      {colorOption && colorOption.optionValues.length > 1 && (
        <fieldset className="pdp-option">
          <legend className="label-type text-ink/50">
            COLORWAY: {selectedColorLabel(colorOption)}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorOption.optionValues.map((v) => (
              <button
                key={v.name}
                type="button"
                className={`swatch-chip${v.selected ? ' is-selected' : ''}`}
                aria-pressed={v.selected}
                aria-label={v.name}
                disabled={!v.exists}
                onClick={() => pick(v.variantUriQuery, false)}
              >
                <span
                  className="swatch-dot"
                  style={{backgroundColor: v.swatch?.color || 'transparent'}}
                  aria-hidden
                >
                  {v.swatch?.image?.previewImage?.url && (
                    <img src={v.swatch.image.previewImage.url} alt="" />
                  )}
                </span>
                <span className="swatch-label">{v.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* 6 — size buttons + sizing modal link */}
      {sizeOption && sizeOption.optionValues.length > 1 && (
        <fieldset id="pdp-size" className="pdp-option mt-4">
          <div className="flex items-center justify-between gap-3">
            <legend className="label-type text-ink/50">SIZE</legend>
            <SizeChartModal />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOption.optionValues.map((v) => (
              <button
                key={v.name}
                type="button"
                className={`size-chip${v.selected && sizeChosen ? ' is-selected' : ''}${
                  !v.available ? ' is-out' : ''
                }`}
                aria-pressed={v.selected && sizeChosen}
                onClick={() => pick(v.variantUriQuery, true)}
              >
                {v.name.toUpperCase()}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="pdp-size-error" role="alert">
              SELECT A SIZE. THIS IS NOT OPTIONAL.
            </p>
          )}
        </fieldset>
      )}

      {/* any other options fall back to buttons */}
      {otherOptions.map((opt) => (
        <fieldset key={opt.name} className="pdp-option mt-4">
          <legend className="label-type text-ink/50">
            {opt.name.toUpperCase()}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {opt.optionValues.map((v) => (
              <button
                key={v.name}
                type="button"
                className={`size-chip${v.selected ? ' is-selected' : ''}`}
                aria-pressed={v.selected}
                onClick={() => pick(v.variantUriQuery, false)}
              >
                {v.name.toUpperCase()}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {/* 7 — add to cart / OOS */}
      <div className="mt-6">
        {available ? (
          <>
            {needsSize ? (
              <button type="button" className="btn w-full" onClick={onRequireSize}>
                ADD TO BASKET
              </button>
            ) : (
              <AddToCartButton
                disabled={!selectedVariant}
                onClick={() => open('cart')}
                lines={
                  selectedVariant
                    ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
                    : []
                }
              >
                ADD TO BASKET
              </AddToCartButton>
            )}

            {/* 8 — express checkout */}
            <ExpressCheckout variantId={selectedVariant?.id} disabled={needsSize} />
          </>
        ) : (
          <OutOfStock />
        )}
      </div>
    </div>
  );
}

function selectedColorLabel(colorOption: MappedProductOptions): string {
  const sel = colorOption.optionValues.find((v) => v.selected);
  return (sel?.name ?? '').toUpperCase();
}

function ExpressCheckout({
  variantId,
  disabled,
}: {
  variantId?: string;
  disabled: boolean;
}) {
  const rootData = useRootData();
  const storeDomain = rootData?.publicStoreDomain;

  if (!variantId || disabled || !storeDomain) return null;

  const domain = storeDomain.startsWith('http')
    ? storeDomain
    : `https://${storeDomain}`;

  return (
    <div className="pdp-express mt-3">
      <p className="label-type mb-1 text-center text-ink/40">— OR EXPRESS —</p>
      <ShopPayButton
        variantIds={[variantId]}
        storeDomain={domain}
        width="100%"
      />
    </div>
  );
}

/** Root loader data (for the store domain). */
function useRootData(): {publicStoreDomain?: string} | undefined {
  return useRouteLoaderData('root') as {publicStoreDomain?: string} | undefined;
}

function OutOfStock() {
  const fetcher = useFetcher<{ok: boolean}>();
  const done = fetcher.data?.ok;

  return (
    <div className="border-2 border-ink bg-fluorescent p-4">
      <p className="sign-type text-lg">OUT OF STOCK. LIKE EVERYTHING GOOD.</p>
      <p className="mt-1 text-sm text-ink/60">
        Leave an address and we’ll page you when it’s back on the shelf.
      </p>
      {done ? (
        <p className="label-type mt-3 border-2 border-ink bg-white px-3 py-2 text-ink">
          NOTED. YOU’LL BE PAGED. EVENTUALLY.
        </p>
      ) : (
        <fetcher.Form method="post" className="mt-3 flex">
          <label className="sr-only" htmlFor="notify-email">
            Email for restock
          </label>
          <input
            id="notify-email"
            name="email"
            type="email"
            required
            placeholder="EMAIL FOR A PAGE"
            className="w-full border-2 border-ink bg-white px-3 py-2 text-sm"
          />
          <button
            className="btn shrink-0"
            name="intent"
            value="notify"
            type="submit"
            disabled={fetcher.state !== 'idle'}
          >
            NOTIFY ME
          </button>
        </fetcher.Form>
      )}
    </div>
  );
}

/** Mobile-only fixed add bar — thumb-reachable CTA on every scroll position. */
function StickyBuyBar({
  title,
  price,
  available,
  needsSize,
  variant,
  onRequireSize,
}: {
  title: string;
  price?: MoneyV2;
  available: boolean;
  needsSize: boolean;
  variant: ProductFragment['selectedOrFirstAvailableVariant'];
  onRequireSize: () => void;
}) {
  const {open} = useAside();
  return (
    <div className="pdp-sticky md:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-wide">
          {title}
        </p>
        {price && (
          <div className="text-sm font-bold">
            <Money data={price} />
          </div>
        )}
      </div>
      <div className="shrink-0">
        {!available ? (
          <button type="button" className="btn" disabled>
            OUT OF STOCK
          </button>
        ) : needsSize ? (
          <button type="button" className="btn" onClick={onRequireSize}>
            ADD TO BASKET
          </button>
        ) : (
          <AddToCartButton
            disabled={!variant}
            onClick={() => open('cart')}
            lines={
              variant
                ? [{merchandiseId: variant.id, quantity: 1, selectedVariant: variant}]
                : []
            }
          >
            ADD TO BASKET
          </AddToCartButton>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Accordion ─────────────────────────── */

function ProductAccordion({copy}: {copy: ReturnType<typeof describeProduct>}) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <details className="pdp-acc" open>
        <summary className="pdp-acc-sum">
          <span className="sign-type text-sm">PRODUCT SPECIFICATIONS</span>
          <span aria-hidden className="pdp-acc-plus">
            +
          </span>
        </summary>
        <div className="pdp-acc-body">
          <ul className="pdp-spec">
            {copy.specs.map((s) => (
              <li key={s} className="label-type text-ink/80">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink/50">{copy.disclosure}</p>
          <p className="mt-3 text-xs text-ink/50">{copy.care.join(' ')}</p>
        </div>
      </details>

      <details className="pdp-acc">
        <summary className="pdp-acc-sum">
          <span className="sign-type text-sm">SIZING</span>
          <span aria-hidden className="pdp-acc-plus">
            +
          </span>
        </summary>
        <div className="pdp-acc-body">
          <p className="text-sm text-ink/70">
            {PRODUCTION.blank}. Measured laid flat, in inches. Between sizes?
            Size up.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-2 border-ink bg-white text-left text-sm">
              <thead>
                <tr className="bg-ink text-linoleum">
                  <th className="label-type p-2">SIZE</th>
                  <th className="label-type p-2">CHEST</th>
                  <th className="label-type p-2">LENGTH</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((r, i) => (
                  <tr key={r.size} className={i % 2 ? 'bg-fluorescent' : 'bg-white'}>
                    <td className="sign-type p-2">{r.size}</td>
                    <td className="p-2">{r.chest}&Prime;</td>
                    <td className="p-2">{r.length}&Prime;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            className="label-type mt-3 inline-block text-signage underline"
            to="/pages/size-guide"
          >
            FULL SIZING DEPARTMENT →
          </Link>
        </div>
      </details>

      <details className="pdp-acc">
        <summary className="pdp-acc-sum">
          <span className="sign-type text-sm">SHIPPING &amp; RECEIVING</span>
          <span aria-hidden className="pdp-acc-plus">
            +
          </span>
        </summary>
        <div className="pdp-acc-body">
          <p className="text-sm text-ink/70">
            Printed to order in 2–5 business days, then 5–7 in transit. US orders
            over $100 ship free. 30-day returns, unworn and unwashed.
          </p>
          <Link
            className="label-type mt-3 inline-block text-signage underline"
            to="/pages/shipping"
          >
            SHIPPING &amp; RECEIVING POLICY →
          </Link>
        </div>
      </details>
    </div>
  );
}

/* ─────────────────────── Below-the-fold blocks ─────────────────────── */

function FrequentlyPaired({
  paired,
  current,
  variant,
}: {
  paired: Promise<SiblingData>;
  current: ProductFragment;
  variant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const {open} = useAside();
  return (
    <section
      aria-labelledby="paired-heading"
      className="col-span-full mt-14 border-t-2 border-ink pt-10"
    >
      <p className="label-type text-ink/50">{VOICE.pairedSub}</p>
      <h2 id="paired-heading" className="sign-type mt-1 text-3xl">
        {VOICE.pairedHeading}
      </h2>

      <Suspense fallback={<span />}>
        <Await resolve={paired} errorElement={<span />}>
          {(data) => {
            const partner = data?.products?.[0];
            if (!partner) {
              return (
                <p className="mt-4 text-sm text-ink/50">
                  Nothing to pair right now. The shirt stands alone.
                </p>
              );
            }
            const partnerVariant = partner.selectedOrFirstAvailableVariant;
            const combined = combinePrice(variant?.price, partnerVariant?.price);
            const lines = [
              variant ? {merchandiseId: variant.id, quantity: 1} : null,
              partnerVariant
                ? {merchandiseId: partnerVariant.id, quantity: 1}
                : null,
            ].filter(Boolean) as {merchandiseId: string; quantity: number}[];

            return (
              <div className="mt-6 border-2 border-ink bg-white">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                  <PairSide
                    to={`/products/${current.handle}`}
                    image={variant?.image}
                    title={current.title}
                    price={variant?.price}
                  />
                  <span className="pair-plus" aria-hidden>
                    +
                  </span>
                  <PairSide
                    to={`/products/${partner.handle}`}
                    image={partner.featuredImage}
                    title={partner.title}
                    price={partnerVariant?.price ?? partner.priceRange.minVariantPrice}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink p-4">
                  <span className="sign-type text-lg">
                    ADD BOTH
                    {combined ? (
                      <span className="ml-2 text-signage">
                        <Money data={combined} />
                      </span>
                    ) : null}
                  </span>
                  {lines.length === 2 ? (
                    <CartForm
                      route="/cart"
                      inputs={{lines}}
                      action={CartForm.ACTIONS.LinesAdd}
                    >
                      {(fetcher) => (
                        <button
                          type="submit"
                          className="btn"
                          onClick={() => open('cart')}
                          disabled={fetcher.state !== 'idle'}
                        >
                          ADD BOTH TO BASKET
                        </button>
                      )}
                    </CartForm>
                  ) : null}
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

function PairSide({
  to,
  image,
  title,
  price,
}: {
  to: string;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  title: string;
  price?: MoneyV2 | null;
}) {
  return (
    <Link to={to} prefetch="intent" className="group block p-3 no-underline">
      {image && (
        <div className="border-2 border-ink">
          <Image alt={image.altText || title} aspectRatio="1/1" data={image} loading="lazy" sizes="240px" />
        </div>
      )}
      <h3 className="sign-type mt-2 line-clamp-2 text-sm group-hover:text-signage">
        {title}
      </h3>
      {price && (
        <span className="text-sm font-bold">
          <Money data={price} />
        </span>
      )}
    </Link>
  );
}

function combinePrice(a?: MoneyV2 | null, b?: MoneyV2 | null): MoneyV2 | null {
  if (!a || !b) return null;
  return {
    amount: (Number(a.amount) + Number(b.amount)).toFixed(2),
    currencyCode: a.currencyCode,
  };
}

function FromTheSameAisle({siblings}: {siblings: Promise<SiblingData>}) {
  return (
    <section
      aria-labelledby="siblings-heading"
      className="col-span-full mt-14 border-t-2 border-ink pt-10"
    >
      <Suspense fallback={<span />}>
        <Await resolve={siblings} errorElement={<span />}>
          {(data) => {
            const items = data?.products ?? [];
            if (!items.length) return <span />;
            return (
              <>
                <p className="label-type text-ink/50">SHELVED NEARBY</p>
                <h2 id="siblings-heading" className="sign-type mt-1 text-3xl">
                  FROM THE SAME AISLE
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {items.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.handle}`}
                      prefetch="intent"
                      className="group block border-2 border-ink bg-white no-underline"
                    >
                      {p.featuredImage && (
                        <div className="border-b-2 border-ink">
                          <Image
                            alt={p.featuredImage.altText || p.title}
                            aspectRatio="1/1"
                            data={p.featuredImage}
                            loading="lazy"
                            sizes="(min-width: 45em) 300px, 50vw"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="sign-type line-clamp-2 text-sm group-hover:text-signage">
                          {p.title}
                        </h3>
                        <span className="mt-1 flex items-baseline gap-1 text-sm font-bold">
                          <Money data={p.priceRange.minVariantPrice} />
                          <span className="label-type text-ink/40">EACH</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

/** Final CTA styled as the checkout-lane belt divider. */
function CheckoutDivider() {
  return (
    <section className="col-span-full mt-16">
      <div className="checkout-divider">
        <span className="checkout-divider-stick" aria-hidden />
        <div className="checkout-divider-body">
          <p className="label-type text-linoleum/60">NEXT CUSTOMER, PLEASE</p>
          <h2 className="sign-type text-3xl text-linoleum sm:text-4xl">
            DONE HERE? THE AISLE ISN’T.
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn" prefetch="intent" to={COLLECTIONS.bestSellers}>
              KEEP SHOPPING
            </Link>
            <Link className="btn btn-outline" prefetch="intent" to="/pages/weekly-circular">
              THIS WEEK’S CIRCULAR
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Queries ─────────────────────────── */

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    tags
    images(first: 12) {
      nodes { id url altText width height }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCTS_BY_TAG_QUERY = `#graphql
  fragment PairedProduct on Product {
    id
    title
    handle
    featuredImage { id altText url width height }
    priceRange { minVariantPrice { amount currencyCode } }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
      price { amount currencyCode }
    }
  }
  query ProductsByTag(
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 8, query: $query, sortKey: BEST_SELLING) {
      nodes { ...PairedProduct }
    }
  }
` as const;
