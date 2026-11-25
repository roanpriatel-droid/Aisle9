import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ALL_AISLES} from '~/lib/brand';

type HeroImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type HeroProduct = {
  id: string;
  handle: string;
  featuredImage?: HeroImage | null;
  cardImages?: {nodes: HeroImage[]} | null;
};

/**
 * Aisle header band — the homepage campaign treatment for every collection:
 * a giant red aisle number, the aisle name at display scale, its blurb, the
 * unit count, and a three-shirt endcap pulled from the aisle itself.
 */
export function CollectionHero({
  marker,
  eyebrow,
  title,
  blurb,
  countText,
  products,
  crumbs,
}: {
  /** "02", "GIFT", "ALL" … shown huge in red. */
  marker: string;
  eyebrow: string;
  title: string;
  blurb?: string | null;
  countText?: string | null;
  products: HeroProduct[];
  crumbs: {label: string; to?: string}[];
}) {
  const picks = products.filter((p) => p.featuredImage).slice(0, 3);
  return (
    <section className="aisle-hero" aria-labelledby="aisle-hero-title">
      <span className="campaign-fluoro" aria-hidden />
      <div className="aisle-hero-inner">
        <div className="aisle-hero-copy">
          <nav aria-label="Breadcrumb" className="aisle-hero-crumbs">
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 ? ' / ' : ''}
                {c.to ? (
                  <Link to={c.to} prefetch="intent">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="aisle-hero-marker" aria-hidden>
            {marker}
          </div>
          <p className="eyebrow text-signage">{eyebrow}</p>
          <h1 id="aisle-hero-title" className="display-xl text-linoleum">
            {title}
          </h1>
          {blurb ? <p className="aisle-hero-blurb">{blurb}</p> : null}
          {countText ? (
            <p className="aisle-hero-count">
              <span className="campaign-dot" aria-hidden /> {countText}
            </p>
          ) : null}
        </div>

        {picks.length === 3 ? (
          <div className="aisle-hero-endcap" aria-hidden>
            <div className="endcap-stack">
              {picks.map((p, i) => {
                const dark = p.cardImages?.nodes?.find(
                  (img) => img.id !== p.featuredImage?.id,
                );
                const image = i !== 1 && dark ? dark : p.featuredImage!;
                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.handle}`}
                    prefetch="intent"
                    tabIndex={-1}
                    className={`endcap-item endcap-item-${i}`}
                  >
                    <Image
                      alt=""
                      aspectRatio="1/1"
                      data={image}
                      loading="eager"
                      sizes="(min-width: 64em) 20vw, 50vw"
                    />
                    <span className="price-gun">$36</span>
                  </Link>
                );
              })}
              <span className="endcap-shelf" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * NEXT AISLE — keeps shoppers walking the store instead of dead-ending at the
 * bottom of a grid. Previous / next follow the numbered directory.
 */
export function NextAisle({handle}: {handle: string}) {
  const order = ALL_AISLES.filter((a) => a.handle !== 'all');
  const i = order.findIndex((a) => a.handle === handle);
  const next = order[(i + 1 + order.length) % order.length] ?? order[0];
  const prev =
    i > 0 ? order[i - 1] : i === 0 ? order[order.length - 1] : undefined;
  return (
    <nav className="next-aisle" aria-label="Keep shopping" data-reveal>
      {prev && i !== -1 ? (
        <Link
          to={`/collections/${prev.handle}`}
          prefetch="intent"
          className="next-aisle-prev"
        >
          <span className="eyebrow">← PREVIOUS · AISLE {prev.n}</span>
          <span className="next-aisle-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      <Link
        to={`/collections/${next.handle}`}
        prefetch="intent"
        className="next-aisle-next"
      >
        <span className="eyebrow">NEXT AISLE · {next.n} →</span>
        <span className="next-aisle-title">{next.title}</span>
      </Link>
    </nav>
  );
}
