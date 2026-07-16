/**
 * Clearance sticker — price-gun sticker, applied slightly crooked.
 * Tag yellow disc with a serrated edge, signage red type.
 * Tag yellow is reserved for this component only.
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
      className={`relative inline-flex h-20 w-20 -rotate-6 items-center justify-center ${className}`}
      aria-label={`${topLine} ${bigLine}`}
    >
      {/* serrated price-gun edge */}
      <svg aria-hidden className="absolute inset-0" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="38" fill="#F7D117" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="#CC2229"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
      <span className="relative flex flex-col items-center">
        <span className="text-[0.5rem] font-bold tracking-[0.14em] text-signage">
          {topLine}
        </span>
        <span className="sign-type text-lg text-signage">{bigLine}</span>
      </span>
    </span>
  );
}
