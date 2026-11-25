import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {COLLECTIONS} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

type ShelfProduct = ShelfData['products'][number];

/**
 * CAMPAIGN HERO — full-bleed, type-led first screen. Oversized headline on
 * the left; on the right an "endcap": three real best sellers stacked like
 * merchandise on a store display, each with a price-gun sticker. Built only
 * from catalog mockups — no stock photography, no fake models.
 */
export function CampaignHero({shelf}: {shelf: Promise<ShelfData | null>}) {
  return (
    <section className="campaign-hero" aria-labelledby="hero-heading">
      <span className="campaign-fluoro" aria-hidden />
      <div className="campaign-inner">
        <div className="campaign-copy">
          <p className="eyebrow text-signage">
            <span className="campaign-dot" aria-hidden /> AISLE 9 · NOW OPEN ·
            24 HRS
          </p>
          <h1 id="hero-heading" className="display-xxl mt-6 text-linoleum">
            Nothing
            <br />
            you need.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-linoleum/70">
            Deadpan graphic tees from a big-box store that does not exist.
            Printed to order, restocked out of obligation.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn btn-invert campaign-cta"
              prefetch="intent"
              to={COLLECTIONS.shopAll}
            >
              SHOP THE AISLES
            </Link>
            <Link
              className="btn btn-ghost-light campaign-cta"
              prefetch="intent"
              to="/pages/gift-guide"
            >
              GIFT DEPARTMENT
            </Link>
          </div>
          <dl className="campaign-facts">
            <div>
              <dt>EVERY SHIRT</dt>
              <dd>$36</dd>
            </div>
            <div>
              <dt>BUY 4+</dt>
              <dd>−30%</dd>
            </div>
            <div>
              <dt>FREE US SHIPPING</dt>
              <dd>$100+</dd>
            </div>
          </dl>
        </div>

        <div className="campaign-endcap" aria-hidden>
          <Suspense fallback={<EndcapFallback />}>
            <Await resolve={shelf} errorElement={<EndcapFallback />}>
              {(data) => <Endcap products={data?.products ?? []} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

/** The second image is the black colorway; alternate dark / light / dark. */
function slotImage(p: ShelfProduct, wantDark: boolean) {
  const dark = p.cardImages?.nodes?.find(
    (img) => img.id !== p.featuredImage?.id,
  );
  return wantDark && dark ? dark : p.featuredImage!;
}

function Endcap({products}: {products: ShelfProduct[]}) {
  const picks = products.filter((p) => p.featuredImage).slice(0, 3);
  if (picks.length < 3) return <EndcapFallback />;
  return (
    <div className="endcap-stack">
      {picks.map((p, i) => (
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
            data={slotImage(p, i !== 1)}
            loading="eager"
            sizes="(min-width: 64em) 26vw, 60vw"
          />
          <span className="price-gun">$36</span>
        </Link>
      ))}
      <span className="endcap-shelf" />
    </div>
  );
}

function EndcapFallback() {
  return (
    <div className="endcap-stack">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`endcap-item endcap-item-${i} endcap-ghost`} />
      ))}
      <span className="endcap-shelf" />
    </div>
  );
}
