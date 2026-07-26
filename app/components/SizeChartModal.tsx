import {useEffect, useState} from 'react';
import {SIZE_CHART} from '~/lib/brand';

/**
 * SIZE CHART — a button that opens a modal with the shared measurements table
 * (SIZE_CHART, same data as the size-guide page). Deadpan institutional styling.
 * Closes on Escape, backdrop click, or the X. Locks body scroll while open.
 */
export function SizeChartModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') setOpen(false);
      },
      {signal: ac.signal},
    );
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      ac.abort();
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="label-type text-signage underline underline-offset-2"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        SIZE CHART →
      </button>

      {open && (
        <div
          className="size-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="size-modal">
            <header className="size-modal-header">
              <div>
                <p className="label-type text-ink/50">MEASURE TWICE, ADMIT ONCE</p>
                <h2 id="size-chart-title" className="sign-type text-2xl">
                  SIZE CHART
                </h2>
              </div>
              <button
                type="button"
                className="size-modal-close reset"
                onClick={() => setOpen(false)}
                aria-label="Close size chart"
              >
                &times;
              </button>
            </header>

            <div className="size-modal-body">
              <p className="text-sm text-ink/70">
                Unisex heavyweight tee. Garment measured laid flat, in inches.
                Between sizes? Size up — the shirt should be relaxed, like you.
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-2 border-ink bg-white text-left">
                  <caption className="sr-only">
                    Garment measurements in inches, laid flat
                  </caption>
                  <thead>
                    <tr className="bg-ink text-linoleum">
                      <th className="label-type p-3">SIZE</th>
                      <th className="label-type p-3">CHEST</th>
                      <th className="label-type p-3">LENGTH</th>
                      <th className="label-type p-3">SLEEVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((row, i) => (
                      <tr
                        key={row.size}
                        className={i % 2 ? 'bg-fluorescent' : 'bg-white'}
                      >
                        <td className="sign-type p-3 text-sm">{row.size}</td>
                        <td className="p-3 text-sm">{row.chest}&Prime;</td>
                        <td className="p-3 text-sm">{row.length}&Prime;</td>
                        <td className="p-3 text-sm">{row.sleeve}&Prime;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="label-type mt-5 text-ink/50">
                Full measuring + care instructions on the{' '}
                <a
                  className="text-signage underline"
                  href="/pages/size-guide"
                >
                  SIZE GUIDE
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
