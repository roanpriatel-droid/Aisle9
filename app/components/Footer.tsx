import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {AisleMarker} from '~/components/brand/AisleMarker';
import {ClearanceSticker} from '~/components/brand/ClearanceSticker';
import {
  BRAND,
  FOOTER_INFO_LINKS,
  FOOTER_POLICY_LINKS,
  FOOTER_SHOP_LINKS,
} from '~/lib/brand';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Footer content comes from brand config, not store menus — see Header.
 * The footer/header props are kept so PageLayout wiring stays stock.
 */
export function Footer(_props: FooterProps) {
  return (
    <footer className="footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col items-start gap-4">
          <AisleMarker variant="footer" />
          <p className="label-type text-linoleum/60">{BRAND.tagline}</p>
          <p className="text-sm text-linoleum/60">
            Deadpan tees, printed on demand.
          </p>
        </div>

        <nav aria-labelledby="footer-shop">
          <h3 id="footer-shop" className="label-type mb-4 text-linoleum/50">
            DEPARTMENTS
          </h3>
          <ul className="flex flex-col gap-2">
            {FOOTER_SHOP_LINKS.map((link) => (
              <li key={link.title}>
                <NavLink
                  className="text-sm font-bold tracking-wide no-underline hover:underline"
                  prefetch="intent"
                  to={link.to}
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-info">
          <h3 id="footer-info" className="label-type mb-4 text-linoleum/50">
            INFORMATION
          </h3>
          <ul className="flex flex-col gap-2">
            {FOOTER_INFO_LINKS.map((link) => (
              <li key={link.title}>
                <NavLink
                  className="text-sm font-bold tracking-wide no-underline hover:underline"
                  prefetch="intent"
                  to={link.to}
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-policies">
          <h3 id="footer-policies" className="label-type mb-4 text-linoleum/50">
            STORE POLICIES
          </h3>
          <ul className="flex flex-col gap-2">
            {FOOTER_POLICY_LINKS.map((link) => (
              <li key={link.title}>
                <NavLink
                  className="text-sm font-bold tracking-wide no-underline hover:underline"
                  prefetch="intent"
                  to={link.to}
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                className="text-sm font-bold tracking-wide no-underline hover:underline"
                prefetch="intent"
                to="/account"
              >
                ACCOUNT
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col items-start gap-4">
          <h3 className="label-type text-linoleum/50">ON THE INTERCOM</h3>
          {/* TODO: real social URLs when accounts exist */}
          <p className="text-sm font-bold tracking-wide">{BRAND.social}</p>
          <ClearanceSticker topLine="AS-IS" bigLine="FINAL" />
        </div>
      </div>

      <div className="border-t border-linoleum/20 px-4 py-4">
        <p className="label-type mx-auto max-w-6xl text-linoleum/40">
          © {new Date().getFullYear()} {BRAND.name}. ALL SALES ARE PROBABLY
          FINE.
        </p>
      </div>
    </footer>
  );
}
