import {Link} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useAside} from '~/components/Aside';
import {VOICE} from '~/lib/brand';

/** Deterministic 0/1 from a GID, so a product always renders the same way. */
export function stableBit(id: string): boolean {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (h & 1) === 1;
}

/** Colorway → swatch fill. Unknown colors fall back to neutral grey. */
const SWATCH: Record<string, string> = {White: '#ffffff', Black: '#1a1a1a'};

type AnyProduct =
  CollectionItemFragment | ProductItemFragment | RecommendedProductFragment;

/**
 * Product card as shelf talker: white card, ink rule, headline field on top,
 * price field below — like the paper tag clipped to the shelf edge. `badge`
 * renders a red shelf tag ("JUST SHELVED"/"TOP SELLER"). `quickAdd` adds a
 * one-tap add-to-basket bar over the media when the product exposes a first
 * available variant (collection grids); otherwise the card just links to the
 * PDP to pick a size.
 */
export function ProductItem({
  product,
  loading,
  badge,
  quickAdd = false,
}: {
  product: AnyProduct;
  loading?: 'eager' | 'lazy';
  badge?: string;
  quickAdd?: boolean;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const featured = product.featuredImage;
  // Second shot (the black colorway) swaps in on hover, so the grid is not a
  // wall of identical white tees and shoppers see both options at a glance.
  const alternate =
    'cardImages' in product
      ? product.cardImages?.nodes?.find((img) => img.id !== featured?.id)
      : undefined;
  // About half the shelf leads with the black colorway (stable per product),
  // so a grid of 375 text tees has rhythm instead of reading as one thumbnail.
  const leadDark = Boolean(alternate) && stableBit(product.id);
  const image = leadDark ? alternate : featured;
  const hoverImage = leadDark ? featured : alternate;
  const colors =
    'cardOptions' in product
      ? (product.cardOptions
          ?.find((o) => /colou?r/i.test(o.name))
          ?.optionValues.map((v) => v.name) ?? [])
      : [];
  const variant =
    'selectedOrFirstAvailableVariant' in product
      ? product.selectedOrFirstAvailableVariant
      : undefined;

  return (
    <div className="product-item">
      <div className="product-item-media">
        {badge && <span className="shelf-badge">{badge}</span>}
        <Link
          className="product-item-imglink"
          prefetch="intent"
          to={variantUrl}
          tabIndex={-1}
          aria-hidden="true"
        >
          {image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 50vw"
            />
          )}
          {hoverImage && (
            <Image
              alt=""
              aria-hidden="true"
              aspectRatio="1/1"
              className="product-item-hover"
              data={hoverImage}
              loading="lazy"
              sizes="(min-width: 45em) 400px, 50vw"
            />
          )}
        </Link>
        <span className="ladder-chip" aria-hidden="true">
          {VOICE.ladderChip}
        </span>
        {quickAdd && variant?.id ? (
          <QuickAdd
            variantId={variant.id}
            available={variant.availableForSale}
          />
        ) : null}
      </div>

      <Link className="shelf-talker" prefetch="intent" to={variantUrl}>
        <h4 className="shelf-title">{product.title}</h4>
        <span className="shelf-price">
          <Money data={product.priceRange.minVariantPrice} />
          <span className="shelf-unit">EACH</span>
          {colors.length > 1 && (
            <span className="shelf-swatches">
              <span className="sr-only">Available in {colors.join(', ')}</span>
              {colors.map((c) => (
                <span
                  key={c}
                  aria-hidden="true"
                  className="shelf-swatch"
                  style={{background: SWATCH[c] ?? '#bbb'}}
                  title={c}
                />
              ))}
            </span>
          )}
        </span>
        <span className="shelf-cta" aria-hidden>
          {VOICE.pickSize} →
        </span>
      </Link>
    </div>
  );
}

/** One-tap add bar over the shelf image. Uses CartForm directly for custom styling. */
function QuickAdd({
  variantId,
  available,
}: {
  variantId: string;
  available: boolean;
}) {
  const {open} = useAside();

  if (!available) {
    return <span className="quick-add quick-add-out">SOLD OUT</span>;
  }

  return (
    <CartForm
      route="/cart"
      inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => (
        <button
          type="submit"
          className="quick-add"
          onClick={() => open('cart')}
          disabled={fetcher.state !== 'idle'}
        >
          {fetcher.state !== 'idle' ? VOICE.quickAdding : VOICE.quickAdd}
        </button>
      )}
    </CartForm>
  );
}
