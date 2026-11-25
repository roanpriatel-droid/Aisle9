import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ShelfData} from '~/lib/shelf';

type ShelfProduct = ShelfData['products'][number];

/** Deadpan staff notes, rotated by slot. Never claims sales or reviews. */
const NOTES = [
  {
    by: 'MANAGEMENT',
    note: 'It says what it says. We stand behind it, at a distance.',
  },
  {
    by: 'NIGHT SHIFT',
    note: 'Shelved this one twice. Thought about it both times.',
  },
  {
    by: 'CUSTOMER SERVICE',
    note: 'Questions about this shirt will be answered by the shirt.',
  },
];

/**
 * STAFF PICK — an editorial spread: one shirt, very large, opposite its own
 * text set as a headline and a taped-on staff recommendation card. `slot`
 * picks which best seller to feature; `flip` mirrors the layout.
 */
export function StaffPick({
  shelf,
  slot,
  flip = false,
}: {
  shelf: Promise<ShelfData | null>;
  slot: number;
  flip?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={shelf} errorElement={null}>
        {(data) => {
          const products = (data?.products ?? []).filter(
            (p) => p.featuredImage,
          );
          const product = products[slot % Math.max(products.length, 1)];
          if (!product) return null;
          return (
            <Spread
              product={product}
              note={NOTES[slot % NOTES.length]}
              flip={flip}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

function Spread({
  product,
  note,
  flip,
}: {
  product: ShelfProduct;
  note: (typeof NOTES)[number];
  flip: boolean;
}) {
  const alt = product.cardImages?.nodes?.find(
    (img) => img.id !== product.featuredImage?.id,
  );
  // Feature the dark colorway when there is one — it photographs heavier.
  const image = alt ?? product.featuredImage!;
  const to = `/products/${product.handle}`;
  return (
    <section
      className={`staff-pick section-pad border-b-2 border-ink ${flip ? 'staff-pick-flip' : ''}`}
      aria-label={`Staff pick: ${product.title}`}
    >
      <div className="staff-pick-inner mx-auto max-w-7xl px-4">
        <Link
          to={to}
          prefetch="intent"
          className="staff-pick-media"
          tabIndex={-1}
          aria-hidden
          data-reveal
        >
          <Image
            alt=""
            aspectRatio="1/1"
            data={image}
            loading="lazy"
            sizes="(min-width: 64em) 45vw, 100vw"
          />
        </Link>
        <div className="staff-pick-copy" data-reveal>
          <p className="eyebrow text-signage">STAFF PICK</p>
          <h2 className="display-l mt-4">
            <Link to={to} prefetch="intent" className="staff-pick-title">
              “{product.title}”
            </Link>
          </h2>
          <figure className="staff-note">
            <span className="staff-note-tape" aria-hidden />
            <blockquote>{note.note}</blockquote>
            <figcaption>— RECOMMENDED BY {note.by}</figcaption>
          </figure>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span className="text-2xl font-bold">
              <Money data={product.priceRange.minVariantPrice} />
            </span>
            <Link to={to} prefetch="intent" className="btn">
              SHOP THIS SHIRT
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
