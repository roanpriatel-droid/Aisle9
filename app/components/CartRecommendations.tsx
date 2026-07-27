import {Suspense} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartRecProductFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {COLLECTIONS, LADDER, VOICE} from '~/lib/brand';

/**
 * CART RECOMMENDATIONS — the impulse rack by the register, made real.
 *
 * One-tap add of best-selling products, framed by the bulk ladder ("add one,
 * hit −10%"). Items already in the cart are excluded. Data comes from the root
 * loader (cached), so opening the drawer is instant. Falls back to a link if
 * nothing suitable is left to suggest.
 */
export function CartRecommendations({
  cartVariantIds,
  quantity,
}: {
  cartVariantIds: Set<string>;
  quantity: number;
}) {
  const root = useRouteLoaderData('root') as
    | {cartRecommendations?: Promise<CartRecProductFragment[]>}
    | undefined;
  const recs = root?.cartRecommendations;

  const nextTier = LADDER.filter((t) => t.discountPct > 0).find(
    (t) => t.qty > quantity,
  );
  const remaining = nextTier ? nextTier.qty - quantity : 0;
  const heading = nextTier
    ? `ADD ${remaining} MORE — HIT −${nextTier.discountPct}%`
    : VOICE.cartUpsellHeading;
  const sub = nextTier
    ? `The ladder takes ${nextTier.discountPct}% off at checkout. It applies itself.`
    : VOICE.cartUpsellSub;

  return (
    <div className="mt-2 border-2 border-ink bg-white p-3">
      <p className="label-type text-signage">{heading}</p>
      <p className="mt-1 text-xs text-ink/60">{sub}</p>

      {recs ? (
        <Suspense fallback={null}>
          <Await resolve={recs} errorElement={<UpsellFallback />}>
            {(items) => {
              const picks = (items ?? [])
                .filter((p) => {
                  const v = p.selectedOrFirstAvailableVariant;
                  return Boolean(
                    v?.id && v.availableForSale && !cartVariantIds.has(v.id),
                  );
                })
                .slice(0, 2);
              if (picks.length === 0) return <UpsellFallback />;
              return (
                <ul className="mt-3 flex flex-col gap-2">
                  {picks.map((p) => (
                    <CartRecRow key={p.id} product={p} />
                  ))}
                </ul>
              );
            }}
          </Await>
        </Suspense>
      ) : (
        <UpsellFallback />
      )}
    </div>
  );
}

function CartRecRow({product}: {product: CartRecProductFragment}) {
  const variant = product.selectedOrFirstAvailableVariant;
  if (!variant?.id) return null;
  const price = variant.price ?? product.priceRange.minVariantPrice;

  return (
    <li className="cart-rec">
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="cart-rec-media"
        aria-label={product.title}
      >
        {product.featuredImage && (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading="lazy"
            sizes="56px"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="cart-rec-title">{product.title}</p>
        <span className="cart-rec-price">
          <Money data={price} />
        </span>
      </div>
      <CartForm
        route="/cart"
        inputs={{lines: [{merchandiseId: variant.id, quantity: 1}]}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher) => (
          <button
            type="submit"
            className="cart-rec-add"
            disabled={fetcher.state !== 'idle'}
            aria-label={`Add ${product.title} to basket`}
          >
            {fetcher.state !== 'idle' ? '…' : 'ADD'}
          </button>
        )}
      </CartForm>
    </li>
  );
}

function UpsellFallback() {
  const {close} = useAside();
  return (
    <Link
      className="label-type mt-3 inline-block text-ink underline underline-offset-2 hover:text-signage"
      to={COLLECTIONS.bestSellers}
      onClick={close}
      prefetch="intent"
    >
      {VOICE.cartUpsellCta} →
    </Link>
  );
}
