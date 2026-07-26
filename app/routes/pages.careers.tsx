import {Link} from 'react-router';
import type {Route} from './+types/pages.careers';
import {BRAND, CAREERS, COLLECTIONS} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — CAREERS`},
    {
      name: 'description',
      content:
        'AISLE 9 careers. We are not hiring. The position of everyone is currently filled.',
    },
  ];
};

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <p className="label-type text-ink/50">{CAREERS.eyebrow}</p>
      <h1 className="sign-type mt-2 text-4xl">{CAREERS.heading}</h1>

      <div className="mt-10 border-2 border-ink bg-white p-10 text-center sm:p-16">
        <p className="sign-type text-3xl text-ink sm:text-5xl">
          {CAREERS.line}
        </p>
        <p className="label-type mt-6 text-signage">{CAREERS.signoff}</p>
      </div>

      <p className="mx-auto mt-8 max-w-md text-center text-sm text-ink/60">
        {CAREERS.sub}
      </p>

      <div className="mt-10 flex justify-center">
        <Link className="btn" prefetch="intent" to={COLLECTIONS.shopAll}>
          RETURN TO THE SALES FLOOR
        </Link>
      </div>
    </div>
  );
}
