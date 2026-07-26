import {Link, useFetcher} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {AisleMarker} from '~/components/brand/AisleMarker';
import {
  BRAND,
  FOOTER_AISLES,
  FOOTER_CORPORATE,
  FOOTER_LEGAL,
  FOOTER_SERVICE,
  PAYMENT_METHODS,
  SAVINGS_CLUB,
} from '~/lib/brand';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Fat footer — four departments (all 13 aisles, service desk, corporate,
 * member services) over a legal bar with payment methods and the copyright
 * stamp. Every link resolves to a real route. Content comes from brand config,
 * not store menus.
 */
export function Footer(_props: FooterProps) {
  return (
    <footer className="footer">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Aisles — all 13 */}
          <nav aria-labelledby="footer-aisles" className="lg:col-span-4">
            <h3 id="footer-aisles" className="label-type mb-4 text-linoleum/50">
              AISLES
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FOOTER_AISLES.map((link, i) => (
                <li key={link.to}>
                  <Link
                    className="flex items-center gap-2 text-sm font-bold tracking-wide no-underline hover:text-linoleum/70"
                    prefetch="intent"
                    to={link.to}
                  >
                    <span className="footer-aisle-num">{i + 1}</span>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service Desk */}
          <nav aria-labelledby="footer-service" className="lg:col-span-3">
            <h3 id="footer-service" className="label-type mb-4 text-linoleum/50">
              SERVICE DESK
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_SERVICE.map((link) => (
                <li key={link.to}>
                  <Link
                    className="text-sm font-bold tracking-wide no-underline hover:text-linoleum/70"
                    prefetch="intent"
                    to={link.to}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Corporate */}
          <nav aria-labelledby="footer-corp" className="lg:col-span-2">
            <h3 id="footer-corp" className="label-type mb-4 text-linoleum/50">
              CORPORATE
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_CORPORATE.map((link) => (
                <li key={link.to}>
                  <Link
                    className="text-sm font-bold tracking-wide no-underline hover:text-linoleum/70"
                    prefetch="intent"
                    to={link.to}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Member services / newsletter */}
          <div className="lg:col-span-3">
            <h3 className="label-type mb-4 text-linoleum/50">MEMBER SERVICES</h3>
            <p className="sign-type text-base text-linoleum">
              {SAVINGS_CLUB.motto}
            </p>
            <FooterSignup />
          </div>
        </div>

        {/* Brand mark */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-linoleum/20 pt-6">
          <AisleMarker variant="footer" />
          <p className="label-type text-linoleum/50">{BRAND.tagline}</p>
        </div>

        {/* Payment methods */}
        <div className="mt-6 flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <span key={method} className="footer-pay">
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-linoleum/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {FOOTER_LEGAL.map((link) => (
              <li key={link.to}>
                <Link
                  className="label-type text-linoleum/50 hover:text-linoleum"
                  prefetch="intent"
                  to={link.to}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label-type text-linoleum/40">
            © {new Date().getFullYear()} {BRAND.name}. NOTHING YOU NEED.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Compact Savings Club signup — posts to the homepage action. */
function FooterSignup() {
  const fetcher = useFetcher<{ok: boolean}>();
  const confirmed = fetcher.data?.ok;

  if (confirmed) {
    return (
      <p className="label-type mt-4 border-2 border-linoleum/40 px-3 py-2 text-linoleum">
        {SAVINGS_CLUB.success}
      </p>
    );
  }

  return (
    <fetcher.Form method="post" action="/" className="mt-4 flex">
      <label className="sr-only" htmlFor="footer-email">
        Email address
      </label>
      <input
        className="w-full border-2 border-linoleum bg-linoleum px-3 py-2 text-sm text-ink placeholder:text-ink/50"
        id="footer-email"
        name="email"
        type="email"
        required
        placeholder={SAVINGS_CLUB.placeholder}
      />
      <button
        className="shrink-0 border-2 border-signage bg-signage px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:border-linoleum hover:bg-linoleum hover:text-ink"
        name="intent"
        value="savings-club"
        type="submit"
        disabled={fetcher.state !== 'idle'}
      >
        {SAVINGS_CLUB.cta}
      </button>
    </fetcher.Form>
  );
}
