import {useFetcher} from 'react-router';
import type {Route} from './+types/pages.contact';
import {BRAND} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — CUSTOMER SERVICE DESK`},
    {
      name: 'description',
      content:
        'Orders, returns, misprints, and general concerns — filed at the customer service desk.',
    },
  ];
};

/**
 * STUB: files the comment card nowhere.
 * TODO(launch): forward to the real support inbox / helpdesk once the store
 * has one (see README launch checklist).
 */
export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const message = String(form.get('message') ?? '');
  if (!email || !message) {
    return {ok: false, error: 'AN EMAIL AND A MESSAGE ARE BOTH REQUIRED.'};
  }
  return {ok: true};
}

export default function ContactPage() {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const filed = fetcher.data?.ok;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">THE DESK AT THE FRONT</p>
      <h1 className="sign-type mt-2 text-4xl">CUSTOMER SERVICE DESK</h1>
      <p className="mt-4 text-ink/70">
        Orders, returns, misprints, compliments filed as complaints. All
        inquiries are read in the order received and answered within 1–2
        business days.
      </p>

      {filed ? (
        <div className="mt-10 border-2 border-ink bg-fluorescent p-6">
          <p className="sign-type text-lg">YOUR COMMENT CARD HAS BEEN FILED.</p>
          <p className="mt-2 text-sm text-ink/70">
            Expect a reply within 1–2 business days. The desk thanks you for
            your patience, which is now mandatory.
          </p>
        </div>
      ) : (
        <fetcher.Form
          method="post"
          className="mt-10 flex flex-col gap-4 border-2 border-ink bg-white p-6"
        >
          <p className="label-type text-ink/50">COMMENT CARD</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="label-type" htmlFor="contact-name">
                NAME
              </label>
              <input id="contact-name" name="name" type="text" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-type" htmlFor="contact-email">
                EMAIL (REQUIRED)
              </label>
              <input id="contact-email" name="email" required type="email" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-type" htmlFor="contact-order">
              ORDER NUMBER (IF APPLICABLE)
            </label>
            <input id="contact-order" name="order" type="text" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-type" htmlFor="contact-message">
              THE ISSUE (REQUIRED)
            </label>
            <textarea
              className="border-2 border-ink bg-white p-3 text-sm"
              id="contact-message"
              name="message"
              required
              rows={5}
            />
          </div>

          {fetcher.data?.error && (
            <p className="label-type text-signage">{fetcher.data.error}</p>
          )}

          <button
            className="btn self-start"
            disabled={fetcher.state !== 'idle'}
            type="submit"
          >
            FILE COMMENT CARD
          </button>
        </fetcher.Form>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="border-2 border-ink bg-white p-5">
          <h2 className="label-type text-ink/50">ON THE INTERCOM</h2>
          <p className="mt-2 font-bold">{BRAND.social}</p>
          <p className="mt-1 text-sm text-ink/60">DMs are monitored. Loosely.</p>
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
