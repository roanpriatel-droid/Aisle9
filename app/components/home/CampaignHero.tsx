import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {COLLECTIONS} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

type ShelfProduct = ShelfData['products'][number];

/**
 * CAMPAIGN HERO — "THE ENTRANCE", campaign edition. Old + new merged:
 *  - the lit storefront marquee sign over the doorway,
 *  - automatic doors that slide open on load,
 *  - behind them, a full-bleed wall of real shirts drifting on conveyor
 *    columns (alternating directions, black/white alternating),
 *  - in front, the oversized headline and a three-shirt endcap with
 *    price-gun stickers.
 * All motion is CSS; reduced-motion users get a still, open doorway.
 */
export function CampaignHero({shelf}: {shelf: Promise<ShelfData | null>}) {
  return (
    <section className="campaign-hero" aria-labelledby="hero-heading">
      {/* Lit storefront marquee */}
      <div className="entrance-sign" aria-hidden>
        <span className="entrance-sign-dot" />
        <div className="entrance-sign-track">
          <span className="entrance-sign-text">
            AISLE 9 · NOW OPEN · NOTHING YOU NEED · EVERY SHIRT $36 · NEW STOCK
            WEEKLY · WELCOME, ALLEGEDLY ·&nbsp;
          </span>
          <span className="entrance-sign-text">
            AISLE 9 · NOW OPEN · NOTHING YOU NEED · EVERY SHIRT $36 · NEW STOCK
            WEEKLY · WELCOME, ALLEGEDLY ·&nbsp;
          </span>
        </div>
      </div>

      <div className="hero-stage">
        {/* The store behind the doors: conveyor wall of real stock */}
        <div className="hero-wall" aria-hidden>
          <Suspense fallback={null}>
            <Await resolve={shelf} errorElement={null}>
              {(data) => <ConveyorWall products={data?.products ?? []} />}
            </Await>
          </Suspense>
        </div>
        <span className="hero-scrim" aria-hidden />
        <span className="campaign-fluoro" aria-hidden />

        {/* Automatic doors — slide apart on load */}
        <div className="entrance-door entrance-door-left" aria-hidden>
          <DoorFace />
        </div>
        <div className="entrance-door entrance-door-right" aria-hidden>
          <DoorFace />
        </div>

        <div className="campaign-inner">
          <div className="campaign-copy">
            <p className="eyebrow text-signage">
              <span className="campaign-dot" aria-hidden /> AISLE 9 · NOW OPEN ·
              24 HRS
            </p>
            <h1 id="hero-heading" className="display-xxl hero-headline">
              Nothing
              <br />
              you need.
            </h1>
            <p className="hero-sub">
              Deadpan graphic tees from a big-box store that does not exist.
              Printed to order, restocked out of obligation.
            </p>
            <div className="hero-ctas">
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
      </div>
    </section>
  );
}

/** The second image is the black colorway. */
function darkImage(p: WallProduct) {
  return p.cardImages?.nodes?.find((img) => img.id !== p.featuredImage?.id);
}
function slotImage(p: WallProduct, wantDark: boolean) {
  const dark = darkImage(p);
  return wantDark && dark ? dark : p.featuredImage!;
}

const COLUMNS = 9;
const PER_COLUMN = 5;

type WallImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};
export type WallProduct = {
  id: string;
  featuredImage?: WallImage | null;
  cardImages?: {nodes: WallImage[]} | null;
};

/**
 * Conveyor columns: each column is a strip of shirts duplicated once so a
 * translateY(-50%) loop is seamless. Odd columns run the other way.
 */
export function ConveyorWall({products}: {products: WallProduct[]}) {
  const src = products.filter((p) => p.featuredImage);
  if (src.length === 0) return null;
  const columns = Array.from({length: COLUMNS}, (_, c) =>
    Array.from({length: PER_COLUMN}, (_, r) => {
      const p = src[(c * PER_COLUMN + r) % src.length];
      return {p, dark: (c + r) % 2 === 0};
    }),
  );
  return (
    <div className="conveyor">
      {columns.map((col, c) => (
        <div
          key={c}
          className={`conveyor-col ${c % 2 ? 'conveyor-down' : 'conveyor-up'}`}
          style={{['--conveyor-dur' as string]: `${46 + (c % 3) * 9}s`}}
        >
          {[0, 1].map((pass) =>
            col.map(({p, dark}, r) => (
              <span key={`${pass}-${r}`} className="conveyor-tile">
                <Image
                  alt=""
                  aspectRatio="1/1"
                  data={slotImage(p, dark)}
                  loading={c < 5 && r < 3 && pass === 0 ? 'eager' : 'lazy'}
                  sizes="12vw"
                />
              </span>
            )),
          )}
        </div>
      ))}
    </div>
  );
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

/** One automatic-door face: frosted panel, decals, handle rail, hazard stripe. */
function DoorFace() {
  return (
    <>
      <span className="door-decal-top">AUTOMATIC</span>
      <span className="door-open">OPEN</span>
      <span className="door-decal-bottom">DO NOT FORCE</span>
      <span className="door-handle" aria-hidden />
      <span className="door-hazard" aria-hidden />
    </>
  );
}
