import type {Route} from './+types/pages.contact';
import {BRAND} from '~/lib/brand';

/**
 * Static contact page — the "customer service desk."
 * Exists in code (not the store CMS) so /pages/contact works on mock.shop
 * and before the real store has pages.
 * TODO(launch): set a real support email + confirm social handle.
 */

export const meta: Route.MetaFunction = () => {
  return [{title: `${BRAND.name} — CUSTOMER SERVICE DESK`}];
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">THE DESK AT THE FRONT</p>
      <h1 className="sign-type mt-2 text-4xl">CUSTOMER SERVICE DESK</h1>
      <p className="mt-4 text-ink/70">
        Questions about an order, a return, or a shirt you regret. All
        inquiries are read in the order received.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        <div className="border-2 border-ink bg-white p-5">
          <h2 className="label-type text-ink/50">EMAIL</h2>
          {/* TODO(launch): real support inbox */}
          <p className="mt-2 font-bold">support@aisle9.example</p>
          <p className="mt-1 text-sm text-ink/60">
            Replies within 1–2 business days.
          </p>
        </div>
        <div className="border-2 border-ink bg-white p-5">
          <h2 className="label-type text-ink/50">ON THE INTERCOM</h2>
          <p className="mt-2 font-bold">{BRAND.social}</p>
          <p className="mt-1 text-sm text-ink/60">
            DMs are monitored. Loosely.
          </p>
        </div>
        <div className="border-2 border-ink bg-white p-5">
          <h2 className="label-type text-ink/50">RETURNS</h2>
          <p className="mt-2 text-sm text-ink/70">
            30 days, unworn, no questions beyond the necessary ones. See{' '}
            <a className="underline" href="/policies/refund-policy">
              the refund policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
