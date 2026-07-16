/**
 * Aisle marker wordmark — PLACEHOLDER.
 * Typographic stand-in for the aisle marker SVG from the Aisle 9 Brand
 * Identity System. Swap the inner markup for the committed SVG when it lands;
 * keep the size variants and props.
 */

type AisleMarkerProps = {
  /** header: compact lockup. hero: giant hanging sign. footer: inverse. */
  variant?: 'header' | 'hero' | 'footer';
};

export function AisleMarker({variant = 'header'}: AisleMarkerProps) {
  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center" aria-label="Aisle 9">
        {/* hanging hardware */}
        <div
          aria-hidden
          className="flex w-40 justify-between px-6 sm:w-56 sm:px-8"
        >
          <span className="h-10 w-0.5 bg-ink sm:h-14" />
          <span className="h-10 w-0.5 bg-ink sm:h-14" />
        </div>
        <div className="flex w-64 flex-col items-center border-4 border-ink bg-ink px-6 pb-5 pt-4 text-linoleum sm:w-80">
          <span className="label-type text-linoleum/80">AISLE</span>
          <span className="sign-type text-[7rem] leading-none sm:text-[9rem]">
            9
          </span>
          <span className="label-type mt-1 border-t-2 border-linoleum/40 pt-2 text-linoleum/80">
            NOTHING YOU NEED
          </span>
        </div>
      </div>
    );
  }

  const inverse = variant === 'footer';
  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 px-2 py-1 ${
        inverse
          ? 'border-linoleum bg-transparent text-linoleum'
          : 'border-ink bg-ink text-linoleum'
      }`}
      aria-label="Aisle 9"
    >
      <span className="label-type">AISLE</span>
      <span className="sign-type text-xl leading-none">9</span>
    </span>
  );
}
