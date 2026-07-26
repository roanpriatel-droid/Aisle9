import type {Route} from './+types/pages.faq';
import {SERVICE_DESK} from '~/lib/brand';
import {Link} from 'react-router';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'AISLE 9 — CUSTOMER SERVICE DESK'},
    {
      name: 'description',
      content:
        'Store policies and answers, numbered for reference. Read in the order received.',
    },
  ];
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">{SERVICE_DESK.eyebrow}</p>
      <h1 className="sign-type mt-2 text-4xl">{SERVICE_DESK.heading}</h1>
      <p className="mt-4 text-ink/70">{SERVICE_DESK.sub}</p>

      <ul className="mt-10 space-y-3">
        {SERVICE_DESK.items.map((item, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <li key={item.q}>
              <details className="group border-2 border-ink bg-white open:bg-fluorescent">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                  <span className="sign-type flex h-8 w-8 shrink-0 items-center justify-center bg-signage text-sm text-linoleum">
                    {num}
                  </span>
                  <span className="sign-type flex-1 text-sm">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="sign-type shrink-0 text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="border-t-2 border-ink p-4 text-sm text-ink/80">
                  {item.a}
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 border-2 border-ink bg-white p-6">
        <p className="label-type text-ink/50">STILL UNANSWERED?</p>
        <h2 className="sign-type mt-2 text-2xl">FILE IT AT THE DESK</h2>
        <p className="mt-3 text-sm text-ink/70">
          Questions not covered above are read in the order received. Bring the
          matter to the Customer Service Desk.
        </p>
        <Link to="/pages/contact" className="btn mt-5 inline-block">
          FILE A COMPLAINT
        </Link>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
          <Link to="/pages/shipping" className="label-type text-signage">
            SHIPPING DETAIL &rarr;
          </Link>
          <Link to="/pages/size-guide" className="label-type text-signage">
            SIZING DEPARTMENT &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
