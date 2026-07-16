import {useFetcher} from 'react-router';
import {VOICE} from '~/lib/brand';

/**
 * "PRICE CHECK" — email capture.
 * Posts to the homepage action, which is a STUB until the real store's email
 * platform (Shopify Email / Klaviyo) is connected. See README launch
 * checklist — do not launch without wiring this.
 */
export function PriceCheck() {
  const fetcher = useFetcher<{ok: boolean}>();
  const confirmed = fetcher.data?.ok;

  return (
    <section
      aria-labelledby="price-check-heading"
      className="bg-signage"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="price-check-heading" className="sign-type text-4xl text-white">
            {VOICE.emailHeading}
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            {VOICE.emailSub}
          </p>
        </div>

        {confirmed ? (
          <p className="label-type border-2 border-white px-4 py-3 text-white">
            {VOICE.emailSuccess}
          </p>
        ) : (
          <fetcher.Form method="post" className="flex w-full max-w-md gap-0">
            <label className="sr-only" htmlFor="price-check-email">
              Email address
            </label>
            <input
              className="w-full border-2 border-ink bg-white px-3 py-3 text-sm"
              id="price-check-email"
              name="email"
              placeholder={VOICE.emailPlaceholder}
              required
              type="email"
            />
            <button
              className="btn shrink-0"
              disabled={fetcher.state !== 'idle'}
              name="intent"
              type="submit"
              value="price-check"
            >
              {VOICE.emailCta}
            </button>
          </fetcher.Form>
        )}
      </div>
    </section>
  );
}
