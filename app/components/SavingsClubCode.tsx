import {Link} from 'react-router';
import {SAVINGS_CLUB} from '~/lib/brand';

/**
 * Post-enrollment confirmation: hands over the real first-order code and a
 * one-tap link that applies it to the cart (Hydrogen's /discount/:code route).
 */
export function SavingsClubCode({tone = 'dark'}: {tone?: 'dark' | 'light'}) {
  const border = tone === 'dark' ? 'border-signage' : 'border-ink';
  return (
    <div
      className={`mt-6 inline-flex max-w-md flex-col gap-2 border-2 ${border} bg-signage px-4 py-3 text-white`}
      role="status"
    >
      <p className="label-type">{SAVINGS_CLUB.success}</p>
      <p className="sign-type text-2xl tracking-widest">{SAVINGS_CLUB.code}</p>
      <Link
        className="label-type underline underline-offset-4 hover:no-underline"
        prefetch="intent"
        to={`/discount/${SAVINGS_CLUB.code}?redirect=/collections/all`}
      >
        {SAVINGS_CLUB.applyCta} →
      </Link>
    </div>
  );
}

export type SavingsClubResult = {ok: boolean; error: 'invalid' | null};
