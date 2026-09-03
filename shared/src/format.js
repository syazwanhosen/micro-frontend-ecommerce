const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatPrice = (value) => currency.format(value);

export const PROMO_CODES = {
  MFE10: { label: '10% off your order', rate: 0.1 },
  SHOP20: { label: '20% off your order', rate: 0.2 },
};

export const SHIPPING_FLAT = 12;
export const FREE_SHIPPING_THRESHOLD = 300;
