import { navigate } from '@mfe/shared';
import { useCart } from './useCart.js';

/**
 * Rendered inside the host's header, but owned entirely by the cart team.
 * It reads the shared store directly — the host never passes the count down.
 */
export default function CartBadge() {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <button
      className="btn btn-ghost cart-button"
      onClick={() => navigate('#/cart')}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      <span aria-hidden="true">🛒</span>
      <span className="hide-sm">Cart</span>
      {count > 0 && <span className="cart-count">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}
