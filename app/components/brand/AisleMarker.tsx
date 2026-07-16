/**
 * Aisle marker wordmark — final in-code implementation.
 * Anatomy of a 1994 grocery aisle sign: signage-red category band on top,
 * ink panel with the oversized aisle number, institutional caps throughout.
 * Rendered in HTML/CSS (not raster) so it stays crisp at every size.
 * If official SVGs are committed later, swap the internals; keep the API.
 */

type AisleMarkerProps = {
  /** header: compact lockup. hero: giant hanging sign. footer: inverse. */
  variant?: 'header' | 'hero' | 'footer';
};

export function AisleMarker({variant = 'header'}: AisleMarkerProps) {
  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center" aria-label="Aisle 9 — Nothing You Need">
        {/* hanging rods */}
        <div aria-hidden className="flex w-44 justify-between px-8 sm:w-60 sm:px-10">
          <span className="h-10 w-1 bg-ink sm:h-14" />
          <span className="h-10 w-1 bg-ink sm:h-14" />
        </div>
        <div className="flex w-72 flex-col shadow-[0_2px_0_rgba(26,26,26,0.25)] sm:w-88">
          <div className="flex items-center justify-between bg-signage px-5 py-2.5">
            <span className="sign-type text-lg text-white sm:text-xl">AISLE</span>
            <span className="label-type text-white/70">DEPT. 09</span>
          </div>
          <div className="flex items-center justify-center bg-ink px-5 pb-4 pt-1">
            <span className="sign-type text-[8rem] leading-none text-linoleum sm:text-[10rem]">
              9
            </span>
          </div>
          <div className="border-t-2 border-linoleum/30 bg-ink px-5 pb-4 text-center">
            <span className="label-type text-linoleum/70">NOTHING YOU NEED</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <span className="inline-flex items-stretch" aria-label="Aisle 9">
        <span className="label-type flex items-center border-2 border-linoleum px-2.5 py-1.5 text-linoleum">
          AISLE
        </span>
        <span className="sign-type flex items-center border-2 border-l-0 border-linoleum bg-linoleum px-2.5 text-xl text-ink">
          9
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-stretch" aria-label="Aisle 9">
      <span className="label-type flex items-center bg-signage px-2.5 py-1.5 text-white">
        AISLE
      </span>
      <span className="sign-type flex items-center bg-ink px-2.5 text-xl text-linoleum">
        9
      </span>
    </span>
  );
}
