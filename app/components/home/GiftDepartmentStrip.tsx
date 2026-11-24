import {Link} from 'react-router';
import {GIFT_DEPARTMENTS, HOLIDAY_CUTOFF} from '~/lib/brand';

/**
 * Homepage GIFT DEPARTMENT strip — shop by recipient. Shows the holiday
 * order-by line until the cutoff passes (server and client agree to the day).
 */
export function GiftDepartmentStrip() {
  const beforeCutoff = Date.now() < Date.parse(HOLIDAY_CUTOFF.orderBy);
  return (
    <section
      aria-labelledby="gift-dept-heading"
      className="border-b-2 border-ink bg-fluorescent"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-type text-signage">
              SEASONAL · GIFT DEPARTMENT
            </p>
            <h2
              id="gift-dept-heading"
              className="sign-type mt-1 text-3xl sm:text-4xl"
            >
              WHO IS THIS FOR, ROUGHLY
            </h2>
          </div>
          {beforeCutoff ? (
            <Link
              to={HOLIDAY_CUTOFF.link}
              prefetch="intent"
              className="label-type border-2 border-ink bg-signage px-3 py-2 text-white! no-underline"
            >
              {HOLIDAY_CUTOFF.label} →
            </Link>
          ) : (
            <Link
              to="/pages/gift-guide"
              prefetch="intent"
              className="label-type text-ink underline underline-offset-4"
            >
              THE FULL GIFT GUIDE →
            </Link>
          )}
        </div>
        <div className="mt-8">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
            {GIFT_DEPARTMENTS.map((d) => (
              <li key={d.handle}>
                <Link
                  to={`/collections/${d.handle}`}
                  prefetch="intent"
                  className="group flex h-full flex-col justify-between gap-4 border-2 border-ink bg-white p-4 no-underline transition-shadow hover:shadow-[5px_5px_0_0_var(--color-ink)]"
                >
                  <span className="sign-type text-base leading-tight group-hover:text-signage">
                    {d.title}
                  </span>
                  <span className="text-xs text-ink/65">{d.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
