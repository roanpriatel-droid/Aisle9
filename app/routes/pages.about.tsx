import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.about';
import {
  BRAND,
  STORE_INFO,
  COLLECTIONS,
  ALL_AISLES,
  storeFacts,
} from '~/lib/brand';
import {BreadcrumbJsonLd} from '~/components/StructuredData';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — STORE INFORMATION`},
    {
      name: 'description',
      content:
        'Corporate document 09. Mission statement, corporate values, a live store directory, hours, the premises, organizational chart, store facts, and revision history — formatted to look official.',
    },
    {property: 'og:title', content: `${BRAND.name} — STORE INFORMATION`},
    {property: 'og:type', content: 'website'},
  ];
};

/**
 * Live figures for the directory and the facts table.
 *
 * One aliased query: a total for the whole floor, then a per-department count.
 * `search(...totalCount)` is the only count the Storefront API will give us, so
 * departments are counted by their tag — the same convention the weekly
 * circular already uses. Never throws: a failed query renders the document with
 * "BEING COUNTED" in place of numbers, which is in voice and still ships.
 */
export async function loader({context}: Route.LoaderArgs) {
  // Aisle 13 is ALL PRODUCTS — the whole floor, so its count is the total
  // rather than a tag lookup. Everything else is counted by its tag.
  const tagged = ALL_AISLES.filter((a) => a.handle !== 'all');

  const query = `#graphql
    query StoreInformation($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      total: search(query: "", first: 0, types: PRODUCT) { totalCount }
      ${tagged
        .map(
          (d, i) =>
            `d${i}: search(query: "tag:'${d.handle}'", first: 0, types: PRODUCT) { totalCount }`,
        )
        .join('\n      ')}
    }
  ` as const;

  const rows = (counts: (number | null)[], total: number | null) =>
    ALL_AISLES.map((a) => {
      const i = tagged.findIndex((t) => t.handle === a.handle);
      return {
        n: a.n,
        title: a.title,
        handle: a.handle,
        blurb: a.blurb,
        count: a.handle === 'all' ? total : (counts[i] ?? null),
      };
    });

  try {
    const data = (await context.storefront.query(query)) as unknown as Record<
      string,
      {totalCount: number} | null
    >;
    const total = data?.total?.totalCount ?? null;

    return {
      items: total ?? 0,
      directory: rows(
        tagged.map((_, i) => data?.[`d${i}`]?.totalCount ?? null),
        total,
      ),
    };
  } catch {
    return {items: 0, directory: rows([], null)};
  }
}

export default function AboutPage() {
  const {items, directory} = useLoaderData<typeof loader>();
  const facts = storeFacts({items, departments: directory.length});

  return (
    <div className="a9-doc mx-auto max-w-6xl px-4 py-10">
      <BreadcrumbJsonLd
        items={[
          {name: 'AISLE 9', path: '/'},
          {name: 'STORE INFORMATION', path: '/pages/about'},
        ]}
      />

      {/* ── Document masthead ─────────────────────────────────── */}
      <header className="border-2 border-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-signage px-4 py-2 sm:px-6">
          <span className="label-type text-white">{STORE_INFO.eyebrow}</span>
          <span className="label-type text-white/80">{BRAND.name}</span>
        </div>

        <div className="bg-ink px-4 py-10 sm:px-8 sm:py-14">
          <h1 className="sign-type text-4xl text-linoleum sm:text-6xl">
            {STORE_INFO.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-linoleum/70">
            {STORE_INFO.subheading}
          </p>
          <p className="label-type mt-6 text-linoleum/50">
            {STORE_INFO.effective}
          </p>
        </div>

        {/* Document-control fields */}
        <dl className="grid grid-cols-2 border-t-2 border-ink bg-white sm:grid-cols-4">
          {STORE_INFO.control.map((f, i) => (
            <div
              key={f.k}
              className={`px-4 py-3 ${
                i > 0 ? 'border-l-2 border-ink' : ''
              } ${i === 2 ? 'border-t-2 sm:border-t-0' : ''} ${
                i === 3 ? 'border-t-2 sm:border-t-0' : ''
              }`}
            >
              <dt className="label-type text-ink/50">{f.k}</dt>
              <dd className="sign-type mt-1 text-lg">{f.v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[13rem_1fr] lg:gap-12">
        {/* ── Section index ──────────────────────────────────── */}
        <nav
          aria-label={STORE_INFO.indexTitle}
          className="a9-doc-index self-start lg:sticky lg:top-24"
        >
          <p className="label-type border-b-2 border-ink pb-2 text-ink/50">
            {STORE_INFO.indexTitle}
          </p>
          <ol className="mt-3 space-y-1.5">
            {STORE_INFO.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="label-type flex gap-2 text-ink/70 no-underline hover:text-signage"
                >
                  <span className="text-ink/40">§{s.n}</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* min-w-0: without it the grid track takes its min-content width from
            the directory table and the whole page scrolls sideways on mobile */}
        <div className="min-w-0">
          {/* ── §1 MISSION ───────────────────────────────────── */}
          <Section id="mission" n={1} title={STORE_INFO.mission.title}>
            {/* Flex rather than absolute: the stamp is a sibling of the text,
                so it can never land on top of it at any container width. */}
            <div className="flex flex-col gap-8 border-2 border-ink bg-white p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <p className="max-w-2xl text-ink/80">{STORE_INFO.mission.body}</p>
              <div className="a9-stamp shrink-0 self-start sm:self-end">
                <span className="sign-type text-xl">
                  {STORE_INFO.mission.stamp}
                </span>
                <span className="label-type mt-1 block text-signage/70">
                  {STORE_INFO.mission.stampNote}
                </span>
              </div>
            </div>
          </Section>

          {/* ── §2 VALUES ────────────────────────────────────── */}
          <Section id="values" n={2} title="CORPORATE VALUES">
            <div className="grid gap-4 sm:grid-cols-2">
              {STORE_INFO.values.map((value, i) => (
                <div
                  key={value.title}
                  className="border-2 border-ink bg-white p-5"
                >
                  <div className="flex items-baseline gap-3 border-b-2 border-ink pb-3">
                    <span className="sign-type text-2xl text-signage">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="sign-type text-sm">{value.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-ink/70">{value.body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── §3 STORE DIRECTORY (live) ────────────────────── */}
          <Section id="directory" n={3} title={STORE_INFO.directoryTitle}>
            <p className="mb-5 max-w-2xl text-sm text-ink/70">
              {STORE_INFO.directoryNote}
            </p>
            <div className="overflow-x-auto border-2 border-ink">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr className="bg-ink text-linoleum">
                    <th scope="col" className="label-type px-4 py-3">
                      {STORE_INFO.directoryCols.n}
                    </th>
                    <th scope="col" className="label-type px-4 py-3">
                      {STORE_INFO.directoryCols.dept}
                    </th>
                    <th scope="col" className="label-type px-4 py-3 text-right">
                      {STORE_INFO.directoryCols.stock}
                    </th>
                    <th scope="col" className="label-type px-4 py-3">
                      <span className="sr-only">{STORE_INFO.directoryGo}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {directory.map((d, i) => (
                    <tr
                      key={d.handle}
                      className={i % 2 === 1 ? 'bg-fluorescent' : 'bg-white'}
                    >
                      <td className="sign-type whitespace-nowrap px-4 py-3 text-ink/40">
                        {String(d.n).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/collections/${d.handle}`}
                          prefetch="intent"
                          className="sign-type text-sm text-ink no-underline hover:text-signage"
                        >
                          {d.title}
                        </Link>
                        <p className="mt-1 hidden text-xs text-ink/50 sm:block">
                          {d.blurb}
                        </p>
                      </td>
                      <td className="sign-type whitespace-nowrap px-4 py-3 text-right">
                        {d.count === null ? (
                          <span className="label-type text-ink/40">
                            {STORE_INFO.directoryEmpty}
                          </span>
                        ) : (
                          <>
                            {d.count}
                            <span className="label-type ml-1 text-ink/40">
                              ITEMS
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/collections/${d.handle}`}
                          prefetch="intent"
                          className="label-type whitespace-nowrap border-2 border-ink bg-white px-3 py-2 text-ink no-underline hover:bg-signage hover:text-white"
                        >
                          {STORE_INFO.directoryGo}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="label-type mt-3 text-ink/40">
              {STORE_INFO.directoryFooter}
            </p>
          </Section>

          {/* ── §4 HOURS ─────────────────────────────────────── */}
          <Section id="hours" n={4} title={STORE_INFO.hoursTitle}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border-2 border-ink">
                <table className="w-full border-collapse text-left">
                  <tbody>
                    {STORE_INFO.hours.map((h, i) => (
                      <tr
                        key={h.d}
                        className={i % 2 === 1 ? 'bg-fluorescent' : 'bg-white'}
                      >
                        <th
                          scope="row"
                          className="label-type px-4 py-2.5 text-ink/60"
                        >
                          {h.d}
                        </th>
                        <td className="sign-type px-4 py-2.5 text-right text-sm">
                          {h.v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="self-center text-sm text-ink/70">
                {STORE_INFO.hoursNote}
              </p>
            </div>
          </Section>

          {/* ── §5 THE PREMISES ──────────────────────────────── */}
          <Section id="premises" n={5} title={STORE_INFO.premisesTitle}>
            <dl className="grid border-2 border-ink sm:grid-cols-2">
              {STORE_INFO.premises.map((p, i) => (
                <div
                  key={p.k}
                  className={`flex items-baseline justify-between gap-4 px-4 py-3 ${
                    i % 2 === 1 ? 'bg-fluorescent' : 'bg-white'
                  } ${i >= 2 ? 'border-t-2 border-ink' : ''} ${
                    i % 2 === 1 ? 'sm:border-l-2 sm:border-ink' : ''
                  }`}
                >
                  <dt className="label-type text-ink/60">{p.k}</dt>
                  <dd className="sign-type text-right text-sm">{p.v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* ── §6 ORG CHART ─────────────────────────────────── */}
          <Section id="org" n={6} title={STORE_INFO.orgTitle}>
            <p className="mb-8 max-w-2xl text-sm text-ink/70">
              {STORE_INFO.orgNote}
            </p>
            <div className="flex flex-col items-center border-2 border-ink bg-white px-4 py-10">
              {STORE_INFO.org.map((node, i) => (
                <div
                  key={node.role}
                  className="flex w-full flex-col items-center"
                >
                  {i > 0 && (
                    <div
                      className="h-7 w-0.5 bg-ink"
                      aria-hidden="true"
                    />
                  )}
                  <div className="w-full max-w-xs border-2 border-ink bg-linoleum px-5 py-4 text-center">
                    <p className="label-type text-ink/50">{node.role}</p>
                    <p className="sign-type mt-1 text-lg">{node.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="label-type mt-3 text-ink/40">
              {STORE_INFO.orgFooter}
            </p>
          </Section>

          {/* ── §7 STORE FACTS ───────────────────────────────── */}
          <Section id="facts" n={7} title={STORE_INFO.factsTitle}>
            <div className="overflow-x-auto border-2 border-ink">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {facts.map((fact, i) => (
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
                      <td className="sign-type px-5 py-3 text-sm">
                        {fact.v}
                        {fact.live && (
                          <span className="label-type ml-2 border border-signage px-1.5 py-0.5 align-middle text-signage">
                            LIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="label-type mt-3 text-ink/40">
              {STORE_INFO.factsNote}
            </p>
          </Section>

          {/* ── §8 REVISION HISTORY ──────────────────────────── */}
          <Section id="revisions" n={8} title={STORE_INFO.revisionsTitle}>
            <div className="overflow-x-auto border-2 border-ink">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-ink text-linoleum">
                    <th scope="col" className="label-type px-4 py-3">
                      {STORE_INFO.revisionCols.rev}
                    </th>
                    <th scope="col" className="label-type px-4 py-3">
                      {STORE_INFO.revisionCols.change}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STORE_INFO.revisions.map((r, i) => (
                    <tr
                      key={r.rev}
                      className={i % 2 === 1 ? 'bg-fluorescent' : 'bg-white'}
                    >
                      <td className="sign-type whitespace-nowrap px-4 py-3 align-top">
                        {r.rev}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink/70">
                        {r.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Closing statement ────────────────────────────── */}
          <section className="mt-14 border-2 border-ink bg-fluorescent p-6 sm:p-8">
            <p className="text-ink/80">{STORE_INFO.statement}</p>
          </section>

          {/* ── Acknowledgement ──────────────────────────────── */}
          <section className="mt-6 border-2 border-ink bg-white p-6 sm:p-8">
            <h2 className="sign-type text-sm">{STORE_INFO.ackTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm text-ink/70">
              {STORE_INFO.ackBody}
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-[2fr_1fr]">
              <div>
                <div className="h-8 border-b-2 border-dashed border-ink" />
                <p className="label-type mt-2 text-ink/50">
                  {STORE_INFO.ackSignature}
                </p>
              </div>
              <div>
                <div className="h-8 border-b-2 border-dashed border-ink" />
                <p className="label-type mt-2 text-ink/50">
                  {STORE_INFO.ackDate}
                </p>
              </div>
            </div>
            <p className="label-type mt-6 text-ink/40">{STORE_INFO.ackNote}</p>
          </section>

          {/* ── Exit ─────────────────────────────────────────── */}
          <div className="a9-doc-exit mt-10 flex flex-wrap gap-3">
            <Link className="btn" prefetch="intent" to={COLLECTIONS.shopAll}>
              {STORE_INFO.exitCta}
            </Link>
            {/* The document prints properly, so offer it. No-ops before
                hydration and on anything without a print dialog. */}
            <button
              type="button"
              onClick={() => window.print()}
              className="label-type border-2 border-ink bg-white px-5 py-3 text-ink hover:bg-fluorescent"
            >
              {STORE_INFO.printCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A numbered document section with a signage rule above it. */
function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="a9-doc-section scroll-mt-24 pt-14 first:pt-0">
      <div className="mb-6 flex items-baseline gap-3 border-b-2 border-ink pb-3">
        <span className="sign-type text-sm text-signage">§{n}</span>
        <h2 className="sign-type text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
