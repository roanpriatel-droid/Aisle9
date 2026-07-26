import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {COLLECTIONS, LADDER, VOICE} from '~/lib/brand';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && (
          <>
            <LadderNudge quantity={cart?.totalQuantity ?? 0} />
            <CartUpsell />
            <CartSummary cart={cart} layout={layout} />
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Bulk-ladder progress: tells the shopper what one more shirt does.
 * The discount itself is applied at checkout by the store's automatic
 * discount — this is signage, not math that changes the subtotal here.
 */
function LadderNudge({quantity}: {quantity: number}) {
  if (quantity < 1) return null;
  const tiers = LADDER.filter((t) => t.discountPct > 0);
  const current = [...tiers].reverse().find((t) => quantity >= t.qty);
  const next = tiers.find((t) => t.qty > quantity);

  return (
    <div className="mt-2 border-2 border-ink bg-fluorescent p-3">
      {current && (
        <p className="label-type text-ink">
          {current.discountPct}% OFF APPLIES AT CHECKOUT.
        </p>
      )}
      {next ? (
        <p className={`label-type ${current ? 'mt-1 text-ink/60' : 'text-ink'}`}>
          ADD {next.qty - quantity} MORE — SAVE {next.discountPct}%.
        </p>
      ) : (
        <p className="label-type mt-1 text-ink/60">
          MAXIMUM DISCOUNT REACHED. THE STORE CONCEDES.
        </p>
      )}
    </div>
  );
}

/**
 * Cart upsell slot — the impulse rack by the register. Deadpan cross-sell into
 * best sellers; no fabricated "you might also like" product data, just a nudge
 * that rewards one more addition (which the bulk ladder literally does).
 */
function CartUpsell() {
  const {close} = useAside();
  return (
    <div className="mt-2 border-2 border-ink bg-white p-3">
      <p className="label-type text-signage">{VOICE.cartUpsellHeading}</p>
      <p className="mt-1 text-xs text-ink/60">{VOICE.cartUpsellSub}</p>
      <Link
        className="label-type mt-2 inline-block text-ink underline underline-offset-2 hover:text-signage"
        to={COLLECTIONS.bestSellers}
        onClick={close}
        prefetch="intent"
      >
        {VOICE.cartUpsellCta} →
      </Link>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>{VOICE.emptyBasket}</p>
      <br />
      <Link
        className="btn"
        to={COLLECTIONS.shopAll}
        onClick={close}
        prefetch="viewport"
      >
        {VOICE.keepShopping}
      </Link>
    </div>
  );
}
