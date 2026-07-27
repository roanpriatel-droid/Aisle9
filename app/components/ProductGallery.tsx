import {useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {useFocusTrap} from '~/lib/useFocusTrap';

export type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * PRODUCT GALLERY — CLS-free, colorway-linked.
 *
 * - `selectedImage` (the current variant's image) drives the main frame, so
 *   changing colorway swaps the hero image.
 * - Thumbnails come from all product images; clicking one pins it.
 * - Tapping the main image opens a lightbox (Esc / backdrop / arrows).
 * - Single-image products degrade to just the framed main image.
 * All frames are locked to 1:1 so there's zero layout shift on load/swap.
 */
export function ProductGallery({
  images,
  selectedImage,
  title,
}: {
  images: GalleryImage[];
  selectedImage?: GalleryImage | null;
  title: string;
}) {
  // De-duplicated image set, variant image first.
  const all = useMemo(() => {
    const seen = new Set<string>();
    const out: GalleryImage[] = [];
    for (const img of [selectedImage, ...images]) {
      if (!img?.url || seen.has(img.url)) continue;
      seen.add(img.url);
      out.push(img);
    }
    return out;
  }, [images, selectedImage]);

  const [activeUrl, setActiveUrl] = useState<string | undefined>(
    selectedImage?.url ?? all[0]?.url,
  );
  const [lightbox, setLightbox] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(lightbox, lightboxRef);

  // Colorway change → follow the variant image.
  useEffect(() => {
    if (selectedImage?.url) setActiveUrl(selectedImage.url);
  }, [selectedImage?.url]);

  useEffect(() => {
    if (!lightbox) return;
    const ac = new AbortController();
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') setLightbox(false);
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      },
      {signal: ac.signal},
    );
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      ac.abort();
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, activeUrl, all.length]);

  const activeIndex = Math.max(
    0,
    all.findIndex((i) => i.url === activeUrl),
  );
  const active = all[activeIndex] ?? all[0];

  function step(dir: number) {
    if (all.length < 2) return;
    const next = (activeIndex + dir + all.length) % all.length;
    setActiveUrl(all[next].url);
  }

  if (!active) {
    return (
      <div className="gallery">
        <div className="gallery-main gallery-empty" aria-hidden />
      </div>
    );
  }

  return (
    <div className="gallery">
      <button
        type="button"
        className="gallery-main"
        onClick={() => setLightbox(true)}
        aria-label="Open image viewer"
      >
        <Image
          alt={active.altText || title}
          aspectRatio="1/1"
          data={active}
          key={active.url}
          loading="eager"
          // @ts-expect-error fetchpriority is a valid attr, not yet typed
          fetchpriority="high"
          sizes="(min-width: 45em) 50vw, 100vw"
        />
        <span aria-hidden className="gallery-zoom">
          TAP TO ENLARGE
        </span>
      </button>

      {all.length > 1 && (
        <div className="gallery-thumbs" role="list">
          {all.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="listitem"
              className={`gallery-thumb${img.url === active.url ? ' is-active' : ''}`}
              aria-label={`View image ${i + 1} of ${all.length}`}
              aria-pressed={img.url === active.url}
              onClick={() => setActiveUrl(img.url)}
            >
              <Image
                alt={img.altText || `${title} — view ${i + 1}`}
                aspectRatio="1/1"
                data={img}
                loading="lazy"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
          ref={lightboxRef}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(false);
          }}
        >
          <div className="gallery-lightbox-bar">
            <span className="label-type text-linoleum/70">
              {activeIndex + 1} / {all.length}
            </span>
            <button
              type="button"
              className="gallery-lightbox-close reset"
              onClick={() => setLightbox(false)}
              aria-label="Close image viewer"
            >
              &times;
            </button>
          </div>
          <div className="gallery-lightbox-stage">
            {all.length > 1 && (
              <button
                type="button"
                className="gallery-nav gallery-nav-prev"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            <Image
              alt={active.altText || title}
              data={active}
              key={active.url}
              sizes="100vw"
            />
            {all.length > 1 && (
              <button
                type="button"
                className="gallery-nav gallery-nav-next"
                onClick={() => step(1)}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
