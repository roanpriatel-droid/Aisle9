import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

/**
 * Product card as shelf talker: white card, ink rule, headline field on top,
 * price field below — like the paper tag clipped to the shelf edge.
 * `badge` renders a red shelf tag (used for "JUST SHELVED" on newest stock).
 */
export function ProductItem({
  product,
  loading,
  badge,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  badge?: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <span className="product-item-media">
        {badge && <span className="shelf-badge">{badge}</span>}
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 50vw"
          />
        )}
      </span>
      <span className="shelf-talker">
        <h4 className="shelf-title">{product.title}</h4>
        <span className="shelf-price">
          <Money data={product.priceRange.minVariantPrice} />
          <span className="shelf-unit">EACH</span>
        </span>
        <span className="shelf-cta" aria-hidden>
          PICK A SIZE →
        </span>
      </span>
    </Link>
  );
}
