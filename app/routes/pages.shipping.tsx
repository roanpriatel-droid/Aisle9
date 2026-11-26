import type {Route} from './+types/pages.shipping';
import {SHIPPING, PRODUCTION} from '~/lib/brand';
import {Link} from 'react-router';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  return seoMeta({
    matches,
    title: 'Shipping & Returns',
    description:
      'Printed to order in 2–5 business days, most US orders arrive 2–5 business days later. Free US shipping over $100. 30-day returns.',
    path: '/pages/shipping',
  });
};

/** Quick facts pulled from PRODUCTION so they match the PDP and FAQ. */
const GLANCE = [
  {label: 'METHOD', value: PRODUCTION.method},
  {label: 'TURNAROUND', value: PRODUCTION.turnaround},
  {label: 'RETURNS', value: PRODUCTION.returns},
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/70">{SHIPPING.eyebrow}</p>
      <h1 className="sign-type mt-2 text-4xl">{SHIPPING.heading}</h1>
      <p className="mt-4 text-ink/70">{SHIPPING.sub}</p>

      {/* AT A GLANCE — dock facts */}
      <div className="mt-10">
        <p className="label-type text-ink/70">AT A GLANCE</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GLANCE.map((fact) => (
            <div key={fact.label} className="border-2 border-ink bg-white p-4">
              <p className="label-type text-ink/70">{fact.label}</p>
              <p className="sign-type mt-1.5 text-sm">{fact.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* POSTED POLICIES — numbered dock document */}
      <div className="mt-12 space-y-4">
        {SHIPPING.sections.map((section, i) => (
          <div key={section.title} className="border-2 border-ink bg-white p-5">
            <div className="flex items-baseline gap-3">
              <span className="label-type bg-signage px-2 py-1 text-linoleum">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="sign-type text-sm">{section.title}</h2>
            </div>
            <p className="mt-3 text-sm text-ink/80">{section.body}</p>
          </div>
        ))}
      </div>

      {/* CTA — the Customer Service Desk */}
      <div className="mt-12 border-2 border-ink bg-fluorescent p-6 text-center">
        <p className="sign-type text-lg">SOMETHING ARRIVED WRONG?</p>
        <Link className="btn mt-4" to="/pages/contact">
          FILE A COMPLAINT
        </Link>
        <p className="label-type mt-4 text-ink/50">
          ALL RETURNS BEGIN AT THE CUSTOMER SERVICE DESK
        </p>
      </div>
    </div>
  );
}
