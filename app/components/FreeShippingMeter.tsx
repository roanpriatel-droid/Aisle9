import {Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {FREE_SHIPPING_THRESHOLD, VOICE} from '~/lib/brand';

/**
 * Free-shipping progress styled as a receipt subtotal: dashed thermal-paper
 * border, a SUBTOTAL line, and a progress bar toward the free-shipping
 * threshold. Reads the cart subtotal; hidden if there's no subtotal yet.
 */
export function FreeShippingMeter({
  subtotal,
}: {
  subtotal?: {amount?: string; currencyCode?: string} | null;
}) {
  if (!subtotal?.amount || !subtotal.currencyCode) return null;

  const amount = Number(subtotal.amount);
  if (!Number.isFinite(amount)) return null;

  const currencyCode = subtotal.currencyCode as CurrencyCode;
  const threshold = FREE_SHIPPING_THRESHOLD;
  const pct = Math.min(100, Math.round((amount / threshold) * 100));
  const remaining = Math.max(0, threshold - amount);
  const earned = amount >= threshold;

  return (
    <div className="receipt-meter" role="status">
      <div className="receipt-row">
        <span className="label-type">SUBTOTAL</span>
        <span className="receipt-amount">
          <Money data={{amount: subtotal.amount, currencyCode}} />
        </span>
      </div>

      <div className="receipt-track" aria-hidden="true">
        <div className="receipt-fill" style={{width: `${pct}%`}} />
      </div>

      <p className="label-type receipt-note">
        {earned ? (
          <span className="text-signage">{VOICE.freeShipEarned}</span>
        ) : (
          <>
            <Money
              data={{amount: remaining.toFixed(2), currencyCode}}
              as="span"
            />{' '}
            {VOICE.freeShipRemaining}
          </>
        )}
      </p>
    </div>
  );
}
