import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {WEEKLY_CIRCULAR} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

/**
 * WEEKLY CIRCULAR teaser — the "now in circulation" band pointing at the
 * signature flyer. An ink pitch plate beside a mock mailer built from REAL
 * products (image + price tag), so the preview isn't hollow. The whole band
 * links to the full circular.
 */
export function WeeklyCircularTeaser({shelf}: {shelf: Promise<ShelfData | null>}) {
  const t = WEEKLY_CIRCULAR.teaser;
  return (
    <section
      aria-labelledby="circular-teaser"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <Link
          to="/pages/weekly-circular"
          prefetch="intent"
          className="group grid items-stretch border-2 border-ink no-underline md:grid-cols-[1.3fr_1fr]"
        >
          <div className="bg-ink p-6 sm:p-10">
            <p className="label-type text-linoleum/50">{t.eyebrow}</p>
            <h2
              id="circular-teaser"
              className="sign-type mt-2 text-4xl text-linoleum sm:text-5xl"
            >
              {t.heading}
            </h2>
            <p className="mt-4 max-w-md text-sm text-linoleum/70">{t.sub}</p>
            <span className="btn mt-6 inline-block border-linoleum bg-linoleum text-ink group-hover:border-signage group-hover:bg-signage group-hover:text-white">
              {t.cta}
            </span>
          </div>

          {/* Mock mailer built from real products */}
          <div className="flex items-center justify-center bg-signage p-6 sm:p-8">
            <div className="w-full max-w-xs -rotate-2 border-2 border-ink bg-white shadow-[10px_10px_0_rgba(26,26,26,1)]">
              <div className="bg-ink px-3 py-1.5 text-center">
                <span className="label-type text-linoleum">
                  AISLE 9 CIRCULAR
                </span>
              </div>
              <Suspense fallback={<MailerFallback />}>
                <Await resolve={shelf} errorElement={<MailerFallback />}>
                  {(data) => {
                    const items = (data?.products ?? []).slice(0, 4);
                    if (items.length === 0) return <MailerFallback />;
                    return (
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {items.map((p) => (
                          <div
                            key={p.id}
                            className="flex flex-col border border-ink/25 bg-linoleum"
                          >
                            {p.featuredImage && (
                              <Image
                                alt={p.featuredImage.altText || p.title}
                                aspectRatio="1/1"
                                data={p.featuredImage}
                                loading="lazy"
                                sizes="120px"
                              />
                            )}
                            <span className="flex items-baseline justify-center gap-1 border-t border-ink/25 py-1">
                              <span className="sign-type text-sm text-signage">
                                <Money
                                  data={p.priceRange.minVariantPrice}
                                  withoutTrailingZeros
                                />
                              </span>
                              <span className="label-type text-ink/40">EA</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </Await>
              </Suspense>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function MailerFallback() {
  return (
    <div className="grid grid-cols-2 gap-1 p-2">
      {Array.from({length: 4}).map((_, i) => (
        <div
          key={i}
          className="flex aspect-square items-center justify-center border border-ink/25 bg-linoleum"
        >
          <span className="label-type text-ink/30">A9</span>
        </div>
      ))}
    </div>
  );
}
