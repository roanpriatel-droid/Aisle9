/**
 * "ARRIVES EST." window for US orders, from Printify's data for this blank
 * (Monster Digital): printing usually 2–5 business days (up to 10 at peak),
 * US standard transit 2–5 business days → typical 4–10 business days.
 * Weekends skipped. Computed at render; the
 * hydration warning is suppressed because the server and browser may be on
 * either side of midnight.
 */
function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}).toUpperCase();

export function DeliveryEstimate() {
  const now = new Date();
  const early = addBusinessDays(now, 2 + 2);
  const late = addBusinessDays(now, 5 + 5);
  return (
    <p className="mt-4 flex flex-wrap items-baseline gap-x-2 border-l-4 border-signage pl-3 text-sm">
      <span className="label-type text-ink/70">US DELIVERY</span>
      <span className="font-bold" suppressHydrationWarning>
        ARRIVES EST. {fmt(early)} – {fmt(late)}
      </span>
      <span className="text-ink/70">
        Printed after you order; peak season can add up to 5 business days.
        Free US shipping over $100.
      </span>
    </p>
  );
}
