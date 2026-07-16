import {POLICIES} from '~/lib/brand';

/** "STORE POLICIES" — four columns, posted like the sign by the returns desk. */
export function TrustBar() {
  return (
    <section
      aria-labelledby="store-policies-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 id="store-policies-heading" className="label-type text-ink/50">
          STORE POLICIES
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLICIES.map((policy) => (
            <div key={policy.title} className="border-2 border-ink bg-white p-4">
              <h3 className="sign-type text-sm">{policy.title}</h3>
              <p className="mt-1.5 text-xs text-ink/60">{policy.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
