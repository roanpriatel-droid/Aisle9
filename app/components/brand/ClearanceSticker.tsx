/**
 * Clearance sticker — PLACEHOLDER.
 * Price-gun sticker: tag yellow disc, signage red type, slight crooked
 * application. Tag yellow is reserved for this component only.
 * Swap for the committed SVG when it lands.
 */

export function ClearanceSticker({
  topLine = 'CLEARANCE',
  bigLine,
  className = '',
}: {
  topLine?: string;
  bigLine: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-20 w-20 -rotate-6 flex-col items-center justify-center rounded-full bg-tag text-center ${className}`}
      aria-label={`${topLine} ${bigLine}`}
    >
      <span className="text-[0.5rem] font-bold tracking-[0.14em] text-signage">
        {topLine}
      </span>
      <span className="sign-type text-lg text-signage">{bigLine}</span>
    </span>
  );
}
