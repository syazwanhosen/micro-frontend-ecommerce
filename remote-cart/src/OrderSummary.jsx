import { computeTotals, formatPrice } from '@mfe/shared';

/** Shared between the cart page and (via its own copy of the math) checkout. */
export default function OrderSummary({ items, promo, children }) {
  const t = computeTotals(items, promo);

  return (
    <div className="panel summary">
      <div className="panel-head">Order summary</div>
      <div className="panel-pad">
        <div className="summary-row">
          <span>Subtotal ({t.count} item{t.count === 1 ? '' : 's'})</span>
          <strong>{formatPrice(t.subtotal)}</strong>
        </div>

        {t.discount > 0 && (
          <div className="summary-row">
            <span>Discount · {promo}</span>
            <strong style={{ color: 'var(--accent)' }}>−{formatPrice(t.discount)}</strong>
          </div>
        )}

        <div className="summary-row">
          <span>Shipping</span>
          <strong>{t.shipping === 0 ? 'Free' : formatPrice(t.shipping)}</strong>
        </div>

        <div className="summary-row">
          <span>Estimated tax</span>
          <strong>{formatPrice(t.tax)}</strong>
        </div>

        <div className="summary-total">
          <span>Total</span>
          <span>{formatPrice(t.total)}</span>
        </div>

        {t.freeShippingGap > 0 && (
          <p className="tiny muted" style={{ marginTop: 10 }}>
            Add {formatPrice(t.freeShippingGap)} more for free shipping.
          </p>
        )}

        {children && <div style={{ marginTop: 16 }}>{children}</div>}
      </div>
    </div>
  );
}
