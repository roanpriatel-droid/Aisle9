import {Link} from 'react-router';
import type {Route} from './+types/pages.about';
import {BRAND, STORE_INFO, COLLECTIONS} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — STORE INFORMATION`},
    {
      name: 'description',
      content:
        'Corporate document 09. Mission statement, values, organizational chart, and store facts, formatted to look official.',
    },
  ];
};

/**
 * STORE INFORMATION — the About page rendered as a corporate-policy document.
 * Static; all copy comes from STORE_INFO in ~/lib/brand.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* Masthead */}
      <header>
        <p className="label-type text-ink/50">{STORE_INFO.eyebrow}</p>
        <h1 className="sign-type mt-2 text-4xl sm:text-5xl">
          {STORE_INFO.heading}
        </h1>
        <p className="label-type mt-3 text-ink/50">{STORE_INFO.effective}</p>
      </header>

      {/* Mission statement */}
      <section className="mt-12 border-2 border-ink bg-white p-6 sm:p-8">
        <h2 className="sign-type text-2xl">{STORE_INFO.mission.title}</h2>
        <p className="mt-4 text-ink/80">{STORE_INFO.mission.body}</p>
      </section>

      {/* Corporate values */}
      <section className="mt-12">
        <h2 className="sign-type text-2xl">CORPORATE VALUES</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STORE_INFO.values.map((value) => (
            <div key={value.title} className="border-2 border-ink bg-white p-5">
              <h3 className="sign-type text-sm">{value.title}</h3>
              <p className="mt-2 text-xs text-ink/60">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Organizational chart */}
      <section className="mt-12">
        <h2 className="sign-type text-2xl">{STORE_INFO.orgTitle}</h2>
        <p className="mt-2 text-ink/70">{STORE_INFO.orgNote}</p>
        <div className="mt-8 flex flex-col items-center">
          {STORE_INFO.org.map((node, i) => (
            <div key={node.role} className="flex w-full flex-col items-center">
              {i > 0 && <div className="h-6 w-0.5 bg-ink" aria-hidden="true" />}
              <div className="w-full max-w-xs border-2 border-ink bg-white px-5 py-4 text-center">
                <p className="label-type text-ink/50">{node.role}</p>
                <p className="sign-type mt-1 text-lg">{node.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store facts */}
      <section className="mt-12">
        <h2 className="sign-type text-2xl">STORE FACTS</h2>
        <div className="mt-6 overflow-x-auto border-2 border-ink">
          <table className="w-full border-collapse text-left">
            <tbody>
              {STORE_INFO.facts.map((fact, i) => (
                <tr
                  key={fact.k}
                  className={i % 2 === 1 ? 'bg-fluorescent' : 'bg-white'}
                >
                  <th
                    scope="row"
                    className="label-type whitespace-nowrap px-5 py-3 align-top text-ink/60"
                  >
                    {fact.k}
                  </th>
                  <td className="sign-type px-5 py-3 text-sm">{fact.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing statement */}
      <section className="mt-12 border-2 border-ink bg-fluorescent p-6 sm:p-8">
        <p className="text-ink/80">{STORE_INFO.statement}</p>
      </section>

      {/* Exit */}
      <div className="mt-12">
        <Link className="btn" prefetch="intent" to={COLLECTIONS.shopAll}>
          PROCEED TO THE SALES FLOOR
        </Link>
      </div>
    </div>
  );
}
