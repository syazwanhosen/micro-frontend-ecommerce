const required = (value) => (value.trim() ? '' : 'Required');

export const SHIPPING_FIELDS = [
  { name: 'fullName', label: 'Full name', placeholder: 'Alex Tan', span: 2 },
  { name: 'email', label: 'Email', placeholder: 'alex@example.com', type: 'email', span: 2 },
  { name: 'address', label: 'Street address', placeholder: '12 Jalan Ampang', span: 2 },
  { name: 'city', label: 'City', placeholder: 'Kuala Lumpur' },
  { name: 'postcode', label: 'Postcode', placeholder: '50450' },
];

export function validateShipping(values) {
  const errors = {};
  for (const field of SHIPPING_FIELDS) {
    const message = required(values[field.name] ?? '');
    if (message) errors[field.name] = message;
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (values.postcode && !/^\d{4,6}$/.test(values.postcode.trim())) {
    errors.postcode = 'Postcode should be 4–6 digits';
  }
  return errors;
}

export function validatePayment(values) {
  const errors = {};
  if (values.method !== 'card') return errors;
  const digits = (values.cardNumber ?? '').replace(/\s/g, '');
  if (digits.length !== 16 || !/^\d+$/.test(digits)) {
    errors.cardNumber = 'Enter the 16 digits on the card';
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry ?? '')) {
    errors.expiry = 'Use MM/YY';
  }
  if (!/^\d{3,4}$/.test(values.cvc ?? '')) {
    errors.cvc = '3 or 4 digits';
  }
  if (!(values.cardName ?? '').trim()) {
    errors.cardName = 'Required';
  }
  return errors;
}

export const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};
