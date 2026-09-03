import { FREE_SHIPPING_THRESHOLD, PROMO_CODES, SHIPPING_FLAT } from './format.js';

const TAX_RATE = 0.08;

/**
 * One pricing function for the whole app, so the cart remote and the checkout
 * remote can never disagree about what the customer owes.
 */
export function computeTotals(items, promoCode) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const promo = promoCode ? PROMO_CODES[promoCode] : null;
  const discount = promo ? subtotal * promo.rate : 0;
  const afterDiscount = subtotal - discount;
  const shipping = items.length === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    promo,
    count: items.reduce((n, i) => n + i.qty, 0),
    freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
  };
}
