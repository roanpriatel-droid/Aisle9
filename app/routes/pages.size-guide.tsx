import type {Route} from './+types/pages.size-guide';
import {BRAND} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — SIZE GUIDE`},
    {
      name: 'description',
      content:
        'Measurements for the unisex heavyweight tee, S through 3XL, plus care instructions.',
    },
  ];
};

/**
 * Standard unisex heavyweight staple-tee measurements (garment laid flat,
 * inches). Verify against the final Printify blank before launch and adjust
 * here if the chosen blank differs.
 */
const SIZES = [
  {size: 'S', chest: 18, length: 28, sleeve: 8.25},
  {size: 'M', chest: 20, length: 29, sleeve: 8.63},
  {size: 'L', chest: 22, length: 30, sleeve: 9},
  {size: 'XL', chest: 24, length: 31, sleeve: 9.38},
  {size: '2XL', chest: 26, length: 32, sleeve: 9.75},
  {size: '3XL', chest: 28, length: 33, sleeve: 10.13},
] as const;

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">MEASURE TWICE, ADMIT ONCE</p>
      <h1 className="sign-type mt-2 text-4xl">SIZE GUIDE</h1>
      <p className="mt-4 text-ink/70">
        Unisex heavyweight tee. Garment measured laid flat, in inches. If you
        are between sizes, size up — the shirt should be relaxed, like you.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-2 border-ink bg-white text-left">
          <caption className="sr-only">
            Garment measurements in inches, laid flat
          </caption>
          <thead>
            <tr className="bg-ink text-linoleum">
              <th className="label-type p-3">SIZE</th>
              <th className="label-type p-3">CHEST (ACROSS)</th>
              <th className="label-type p-3">LENGTH</th>
              <th className="label-type p-3">SLEEVE</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((row, i) => (
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

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="border-2 border-ink bg-white p-4">
          <h2 className="sign-type text-sm">HOW TO MEASURE</h2>
          <p className="mt-1.5 text-xs text-ink/60">
            Take a shirt that fits how you want this one to fit. Lay it flat.
            Measure armpit to armpit (chest), collar to hem (length). Compare
            to the table. Trust the table over your optimism.
          </p>
        </div>
        <div className="border-2 border-ink bg-white p-4">
          <h2 className="sign-type text-sm">CARE INSTRUCTIONS</h2>
          <p className="mt-1.5 text-xs text-ink/60">
            Wash inside out. Cold water. Hang dry or tumble low. Do not iron
            the print. Do not dry clean a t-shirt; nobody involved would
            respect it.
          </p>
        </div>
      </div>

      <div className="mt-10 border-2 border-ink bg-fluorescent p-6 text-center">
        <p className="sign-type text-lg">KNOW YOUR SIZE NOW?</p>
        <p className="mt-1.5 text-sm text-ink/60">
          Remember: 2 tees save 10%. 3 save 20%. 4 save 30%.
        </p>
        <a className="btn mt-4" href="/collections/all">
          PICK YOUR SHIRTS
        </a>
      </div>
    </div>
  );
}
