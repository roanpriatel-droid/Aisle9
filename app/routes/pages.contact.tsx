import type {Route} from './+types/pages.contact';
import {useFetcher} from 'react-router';
import {CONTACT} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'AISLE 9 — FILE A COMPLAINT'},
    {
      name: 'description',
      content:
        'Submit a complaint, compliment, or statement to Customer Relations. Read in the order received. Estimated response time: eventually.',
    },
  ];
};

export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get('intent') === 'complaint') return {ok: true};
  return {ok: false};
}

export default function ContactPage() {
  const fetcher = useFetcher<{ok: boolean}>();

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
