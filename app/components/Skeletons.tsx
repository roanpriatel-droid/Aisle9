/**
 * Loading skeletons — empty shelf frames shown while product data streams in.
 * Flat, institutional, no shimmer that pretends to be charming; just the ink
 * rule and a "STOCKING" label so the layout doesn't jump.
 */

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden>
      <div className="skeleton-media">
        <span className="label-type skeleton-note">STOCKING…</span>
      </div>
      <div className="skeleton-talker">
        <span className="skeleton-line skeleton-line-title" />
        <span className="skeleton-line skeleton-line-price" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({count = 4}: {count?: number}) {
  return (
    <div
      className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      role="status"
      aria-label="Stocking the shelves"
    >
      {Array.from({length: count}).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
