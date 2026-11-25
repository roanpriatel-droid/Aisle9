import type {Route} from './+types/pages.contact';
import {useFetcher} from 'react-router';
import {CONTACT} from '~/lib/brand';
import {fileComplaint, isEmail} from '~/lib/admin.server';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  return seoMeta({
    matches,
    title: 'Contact Customer Service',
    description:
      'Contact AISLE 9 Customer Relations about orders, sizing or general grievances. Email aisle9@stratosync.solutions. Response time: eventually.',
    path: '/pages/contact',
  });
};

export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get('intent') !== 'complaint') return {ok: false, failed: false};
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!isEmail(email)) return {ok: false, failed: true};
  const filed = await fileComplaint(context.env, {
    email,
    order_number: String(form.get('order') ?? ''),
    nature: String(form.get('nature') ?? ''),
    severity: String(form.get('severity') ?? ''),
    body: String(form.get('body') ?? ''),
  });
  return {ok: filed, failed: !filed};
}

export default function ContactPage() {
  const fetcher = useFetcher<{ok: boolean; failed: boolean}>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">{CONTACT.eyebrow}</p>
      <h1 className="sign-type mt-2 text-4xl">{CONTACT.heading}</h1>
      <p className="mt-4 text-ink/70">{CONTACT.sub}</p>

      <p className="label-type mt-6 inline-block border-2 border-ink bg-signage px-3 py-2 text-linoleum">
        {CONTACT.responseTime}
      </p>

      {fetcher.data?.ok ? (
        <div className="mt-10 border-2 border-ink bg-fluorescent p-6">
          <p className="label-type text-ink">{CONTACT.success}</p>
        </div>
      ) : (
        <fetcher.Form method="post" className="mt-10 space-y-6">
          {fetcher.data?.failed && (
            <p
              className="label-type border-2 border-ink bg-signage px-3 py-2 text-linoleum"
              role="alert"
            >
              {CONTACT.failure}
            </p>
          )}
          <input type="hidden" name="intent" value="complaint" />

          <div>
            <label htmlFor="email" className="label-type block text-ink/70">
              {CONTACT.emailLabel}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full border-2 border-ink bg-white px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="order" className="label-type block text-ink/70">
              {CONTACT.orderLabel}
            </label>
            <input
              id="order"
              name="order"
              type="text"
              className="mt-2 w-full border-2 border-ink bg-white px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="nature" className="label-type block text-ink/70">
              {CONTACT.natureLabel}
            </label>
            <select
              id="nature"
              name="nature"
              className="mt-2 w-full border-2 border-ink bg-white px-3 py-3 text-sm"
            >
              {CONTACT.natures.map((nature) => (
                <option key={nature} value={nature}>
                  {nature}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="label-type block text-ink/70">
              {CONTACT.severityLabel}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTACT.severity.map((level, i) => (
                <label
                  key={level}
                  className="label-type flex cursor-pointer items-center gap-2 border-2 border-ink bg-white px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    defaultChecked={i === 0}
                    className="accent-signage"
                  />
                  {level}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="body" className="label-type block text-ink/70">
              {CONTACT.bodyLabel}
            </label>
            <textarea
              id="body"
              name="body"
              rows={5}
              required
              placeholder={CONTACT.bodyPlaceholder}
              className="mt-2 w-full border-2 border-ink bg-white px-3 py-3 text-sm"
            />
          </div>

          <button type="submit" className="btn w-full">
            {CONTACT.submit}
          </button>
        </fetcher.Form>
      )}

      <p className="label-type mt-8 text-ink/50">
        {CONTACT.deskNote}{' '}
        <a
          href={`mailto:${CONTACT.deskEmail}`}
          className="text-signage underline"
        >
          {CONTACT.deskEmail}
        </a>
      </p>
    </div>
  );
}
