import {useState} from 'react';
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
  reveal = false,
}: {
  product: AnyProduct;
  loading?: 'eager' | 'lazy';
  badge?: string;
  quickAdd?: boolean;
  /** Fade up on scroll (grids that don't wrap cards themselves). */
  reveal?: boolean;
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
  // Quick add follows the colorway the card is showing.
  const leadColor = leadDark ? 'Black' : 'White';
  const cardVariants =
    'cardVariants' in product ? (product.cardVariants?.nodes ?? []) : [];
  const sizeOptions = cardVariants
    .map((v) => ({
      id: v.id,
      available: v.availableForSale,
      color: v.selectedOptions.find((o) => /colou?r/i.test(o.name))?.value,
      size: v.selectedOptions.find((o) => /size/i.test(o.name))?.value ?? '',
    }))
    .filter((v) => !v.color || v.color === leadColor)
    .sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
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
    <div className="product-item" data-reveal={reveal ? '' : undefined}>
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
          sizeOptions.length > 1 ? (
            <SizePicker color={leadColor} sizes={sizeOptions} />
          ) : (
            <QuickAdd
              variantId={variant.id}
              available={variant.availableForSale}
            />
          )
        ) : null}
      </div>

      <Link className="shelf-talker" prefetch="intent" to={variantUrl}>
        <h3 className="shelf-title">{product.title}</h3>
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

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
function sizeRank(size: string) {
  const i = SIZE_ORDER.indexOf(size.toUpperCase());
  return i === -1 ? 99 : i;
}

/**
 * Quick add, done properly: "QUICK ADD" opens a size row for the colorway
 * on display; one tap adds that exact variant. (Previously it silently added
 * the first variant — always White / S.)
 */
function SizePicker({
  color,
  sizes,
}: {
  color: string;
  sizes: {id: string; available: boolean; size: string}[];
}) {
  const [open, setOpen] = useState(false);
  const {open: openAside} = useAside();
  if (!sizes.some((s) => s.available)) {
    return <span className="quick-add quick-add-out">SOLD OUT</span>;
  }
  if (!open) {
    return (
      <button
        type="button"
        className="quick-add"
        onClick={() => setOpen(true)}
        aria-expanded={false}
      >
        {VOICE.quickAdd} +
      </button>
    );
  }
  return (
    <div
      className="quick-sizes"
      role="group"
      aria-label={`Choose a size (${color})`}
    >
      <span className="quick-sizes-label">
        {color.toUpperCase()} · SIZE
        <button
          type="button"
          className="quick-sizes-close"
          aria-label="Close size picker"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </span>
      <div className="quick-sizes-row">
        {sizes.map((s) => (
          <CartForm
            key={s.id}
            route="/cart"
            inputs={{lines: [{merchandiseId: s.id, quantity: 1}]}}
            action={CartForm.ACTIONS.LinesAdd}
          >
            {(fetcher) => (
              <button
                type="submit"
                className="quick-size"
                disabled={!s.available || fetcher.state !== 'idle'}
                onClick={() => openAside('cart')}
                aria-label={`Add size ${s.size} to basket`}
              >
                {s.size}
              </button>
            )}
          </CartForm>
        ))}
      </div>
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
