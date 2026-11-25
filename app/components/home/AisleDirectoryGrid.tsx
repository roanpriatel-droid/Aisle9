import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {AISLES, DEPARTMENTS} from '~/lib/brand';

export type AislePreview = {
  handle: string;
  image: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * THE STORE DIRECTORY — nine big aisle signs, each with a real shirt from that
 * aisle peeking in. Front-of-store departments run underneath as a sign rail.
 */
export function AisleDirectoryGrid({
  previews,
}: {
  previews: Promise<AislePreview[]>;
}) {
  return (
    <section
      aria-labelledby="directory-heading"
      className="section-pad border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="flex flex-wrap items-end justify-between gap-6"
          data-reveal
        >
          <div>
            <p className="eyebrow text-signage">STORE DIRECTORY</p>
            <h2 id="directory-heading" className="display-xl mt-3">
              Find your aisle.
            </h2>
          </div>
          <p className="max-w-sm text-ink/70">
            Nine departments, numbered as posted. Every shirt is $36 and the
            bulk ladder works across all of them.
          </p>
        </div>

        <Suspense fallback={<DirectoryTiles previews={[]} />}>
          <Await
            resolve={previews}
            errorElement={<DirectoryTiles previews={[]} />}
          >
            {(data) => <DirectoryTiles previews={data} />}
          </Await>
        </Suspense>

        <ul className="aisle-rail" data-reveal>
          {DEPARTMENTS.map((d) => (
            <li key={d.handle}>
              <Link to={d.to} prefetch="intent">
                <span className="aisle-rail-n">{d.n}</span>
                {d.title}
                <span aria-hidden> →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DirectoryTiles({previews}: {previews: AislePreview[]}) {
  const byHandle = new Map(previews.map((p) => [p.handle, p.image]));
  return (
    <ul className="aisle-tiles">
      {AISLES.map((a, i) => {
        const image = byHandle.get(a.handle);
        return (
          <li
            key={a.handle}
            data-reveal
            style={{['--reveal-i' as string]: i % 3}}
          >
            <Link
              to={`/collections/${a.handle}`}
              prefetch="intent"
              className="aisle-tile group"
            >
              <span className="aisle-tile-n">
                {String(a.n).padStart(2, '0')}
              </span>
              <span className="aisle-tile-body">
                <span className="aisle-tile-title">{a.title}</span>
                <span className="aisle-tile-blurb">{a.blurb}</span>
                <span className="aisle-tile-cta">SHOP AISLE {a.n} →</span>
              </span>
              {image ? (
                <span className="aisle-tile-peek" aria-hidden>
                  <Image
                    alt=""
                    aspectRatio="1/1"
                    data={image}
                    loading="lazy"
                    sizes="(min-width: 64em) 14vw, 30vw"
                  />
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
