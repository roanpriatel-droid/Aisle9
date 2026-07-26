import {Link} from 'react-router';
import {MATCHING_SETS} from '~/lib/brand';

/**
 * MATCHING SETS — styled as a BOGO shelf-talker: the little sign that clips to
 * the shelf edge and shouts a deal. Fluorescent panel, ink rule, a torn-ticket
 * "PAIR DEAL" tab. Static copy from brand.ts; links to the collection.
 */
export function MatchingSetsPromo() {
  return (
    <section
      aria-labelledby="matching-sets-heading"
      className="border-b-2 border-ink bg-fluorescent"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid items-stretch gap-0 border-2 border-ink bg-white md:grid-cols-[1fr_auto]">
          <div className="p-6 sm:p-8">
            <p className="label-type text-signage">{MATCHING_SETS.eyebrow}</p>
            <h2
              id="matching-sets-heading"
              className="sign-type mt-2 text-3xl sm:text-4xl"
            >
              {MATCHING_SETS.heading}
            </h2>
            <p className="sign-type mt-3 text-lg text-ink/80">
              {MATCHING_SETS.pitch}
            </p>
            <p className="mt-3 max-w-xl text-sm text-ink/60">
              {MATCHING_SETS.sub}
            </p>
            <Link className="btn mt-6" prefetch="intent" to={MATCHING_SETS.to}>
              {MATCHING_SETS.cta}
            </Link>
          </div>

          {/* BOGO ticket */}
          <div className="flex flex-col items-center justify-center gap-2 border-t-2 border-ink bg-ink px-6 py-8 text-center md:border-l-2 md:border-t-0">
            <span className="sign-type text-5xl leading-none text-signage">
              2
            </span>
            <span className="label-type text-linoleum/70">SHIRTS</span>
            <span className="my-1 h-px w-10 bg-linoleum/30" />
            <span className="sign-type text-2xl leading-none text-linoleum">
              −10%
            </span>
            <span className="label-type text-linoleum/60">APPLIES ITSELF</span>
          </div>
        </div>

        <p className="label-type mt-3 text-center text-ink/50">
          {MATCHING_SETS.bogoLine}
        </p>
      </div>
    </section>
  );
}
