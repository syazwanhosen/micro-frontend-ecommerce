import { useMemo, useState } from 'react';
import { cartStore, computeTotals, formatPrice, navigate, toast } from '@mfe/shared';
import { useCart } from './useCart.js';
import Field from './Field.jsx';
import {
  SHIPPING_FIELDS,
  formatCardNumber,
  formatExpiry,
  validatePayment,
  validateShipping,
} from './validate.js';

const STEPS = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

const emptyShipping = { fullName: '', email: '', address: '', city: '', postcode: '' };
const emptyPayment = { method: 'card', cardName: '', cardNumber: '', expiry: '', cvc: '' };

export default function CheckoutPage() {
  const { items, promo } = useCart();
  const [step, setStep] = useState('shipping');
  const [shipping, setShipping] = useState(emptyShipping);
  const [payment, setPayment] = useState(emptyPayment);
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);

  const totals = useMemo(() => computeTotals(items, promo), [items, promo]);
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const update = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const goToPayment = (event) => {
    event.preventDefault();
    const found = validateShipping(shipping);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep('payment');
  };

  const goToReview = (event) => {
    event.preventDefault();
    const found = validatePayment(payment);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep('review');
  };

  const placeOrder = () => {
    // No backend: the "order" is created locally and the cart is emptied.
    setOrder({
      id: `MFE-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      items,
      totals,
      email: shipping.email,
      eta: new Date(Date.now() + 3 * 864e5).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    });
    cartStore.clear();
    toast('Order placed', 'success');
  };

  if (order) {
    return (
      <section className="stack" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="panel panel-pad center stack" style={{ alignItems: 'center' }}>
          <span className="empty-glyph" aria-hidden="true">🎉</span>
          <h1>Thanks for your order</h1>
          <p className="muted">
            Confirmation sent to <strong>{order.email}</strong>. Arriving {order.eta}.
          </p>
          <div className="panel panel-pad" style={{ width: '100%', textAlign: 'left', marginTop: 8 }}>
            <div className="summary-row">
              <span>Order number</span>
              <strong>{order.id}</strong>
            </div>
            {order.items.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>
                  {item.qty} × {item.name}
                </span>
                <strong>{formatPrice(item.price * item.qty)}</strong>
              </div>
            ))}
            <div className="summary-total">
              <span>Paid</span>
              <span>{formatPrice(order.totals.total)}</span>
            </div>
          </div>
          <button className="btn btn-lg" onClick={() => navigate('#/')}>
            Back to the shop
          </button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <span className="empty-glyph" aria-hidden="true">🧾</span>
        <h2>There is nothing to check out</h2>
        <p className="small">Add a product to your cart first.</p>
        <button className="btn" onClick={() => navigate('#/')}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <section className="stack">
      <div>
        <h1>Checkout</h1>
        <p className="muted small" style={{ marginTop: 4 }}>
          Served by the <strong>checkout</strong> micro frontend.
        </p>
      </div>

      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={s.id} className="step" data-state={i === stepIndex ? 'active' : i < stepIndex ? 'done' : 'todo'}>
            <span className="step-num">{i < stepIndex ? '✓' : i + 1}</span>
            {s.label}
          </div>
        ))}
      </div>

      <div className="cart-layout">
        <div className="panel panel-pad">
          {step === 'shipping' && (
            <form className="stack" onSubmit={goToPayment} noValidate>
              <h3>Where should it go?</h3>
              <div className="form-grid field-row">
                {SHIPPING_FIELDS.map((field) => (
                  <Field
                    key={field.name}
                    {...field}
                    value={shipping[field.name]}
                    error={errors[field.name]}
                    onChange={update(setShipping)}
                  />
                ))}
              </div>
              <button className="btn btn-lg" type="submit">
                Continue to payment
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form className="stack" onSubmit={goToReview} noValidate>
              <h3>How would you like to pay?</h3>

              <div className="chips">
                {[
                  ['card', '💳 Card'],
                  ['cod', '📦 Cash on delivery'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="chip"
                    aria-pressed={payment.method === value}
                    onClick={() => setPayment((p) => ({ ...p, method: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {payment.method === 'card' ? (
                <>
                  <p className="tiny muted">
                    Demo only — nothing is submitted anywhere. Use any 16 digits, e.g. 4242 4242 4242 4242.
                  </p>
                  <div className="form-grid field-row">
                    <Field
                      label="Name on card"
                      name="cardName"
                      span={2}
                      placeholder="ALEX TAN"
                      value={payment.cardName}
                      error={errors.cardName}
                      onChange={update(setPayment)}
                    />
                    <Field
                      label="Card number"
                      name="cardNumber"
                      span={2}
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      value={payment.cardNumber}
                      error={errors.cardNumber}
                      onChange={(e) =>
                        setPayment((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))
                      }
                    />
                    <Field
                      label="Expiry"
                      name="expiry"
                      inputMode="numeric"
                      placeholder="09/29"
                      value={payment.expiry}
                      error={errors.expiry}
                      onChange={(e) => setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                    />
                    <Field
                      label="CVC"
                      name="cvc"
                      inputMode="numeric"
                      placeholder="123"
                      value={payment.cvc}
                      error={errors.cvc}
                      onChange={(e) =>
                        setPayment((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                      }
                    />
                  </div>
                </>
              ) : (
                <p className="muted small">
                  Pay the courier when the parcel arrives. Have {formatPrice(totals.total)} ready.
                </p>
              )}

              <div className="row">
                <button className="btn btn-ghost" type="button" onClick={() => setStep('shipping')}>
                  Back
                </button>
                <button className="btn btn-lg" type="submit">
                  Review order
                </button>
              </div>
            </form>
          )}

          {step === 'review' && (
            <div className="stack">
              <h3>Everything look right?</h3>

              <div className="panel panel-pad stack" style={{ gap: 4 }}>
                <span className="card-cat">Shipping to</span>
                <strong>{shipping.fullName}</strong>
                <span className="small muted">
                  {shipping.address}, {shipping.city} {shipping.postcode}
                </span>
                <span className="small muted">{shipping.email}</span>
              </div>

              <div className="panel panel-pad stack" style={{ gap: 4 }}>
                <span className="card-cat">Paying with</span>
                <strong>
                  {payment.method === 'card'
                    ? `Card ending ${payment.cardNumber.replace(/\s/g, '').slice(-4)}`
                    : 'Cash on delivery'}
                </strong>
              </div>

              <div className="panel">
                {items.map((item) => (
                  <div className="line" key={item.id}>
                    <div className="line-thumb" style={{ '--tint': item.tint }} aria-hidden="true">
                      {item.emoji}
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <div className="small muted">Quantity {item.qty}</div>
                    </div>
                    <span className="price">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="row">
                <button className="btn btn-ghost" type="button" onClick={() => setStep('payment')}>
                  Back
                </button>
                <button className="btn btn-lg" onClick={placeOrder}>
                  Place order · {formatPrice(totals.total)}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="panel summary">
          <div className="panel-head">Order summary</div>
          <div className="panel-pad">
            <div className="summary-row">
              <span>
                Subtotal ({totals.count} item{totals.count === 1 ? '' : 's'})
              </span>
              <strong>{formatPrice(totals.subtotal)}</strong>
            </div>
            {totals.discount > 0 && (
              <div className="summary-row">
                <span>Discount · {promo}</span>
                <strong style={{ color: 'var(--accent)' }}>−{formatPrice(totals.discount)}</strong>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</strong>
            </div>
            <div className="summary-row">
              <span>Estimated tax</span>
              <strong>{formatPrice(totals.tax)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
            <button
              className="btn btn-quiet btn-block"
              style={{ marginTop: 14 }}
              onClick={() => navigate('#/cart')}
            >
              Edit cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
