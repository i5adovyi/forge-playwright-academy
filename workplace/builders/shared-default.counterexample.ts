import type { CheckoutData, CheckoutOverrides } from './builders';

// Deliberately broken interview sample. It is used only by the proof command,
// never by the reference builder. Identify both default and override aliasing.
const defaults: CheckoutData = {
  shipping: { name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA' },
  items: [{ productId: 'p1', quantity: 1 }],
  promoCode: null,
};

export function buildWithSharedDefaults(overrides: CheckoutOverrides = {}): CheckoutData {
  return {
    ...defaults,
    shipping: overrides.shipping ? { ...defaults.shipping, ...overrides.shipping } : defaults.shipping,
    items: overrides.items ? [...overrides.items] : defaults.items,
    promoCode: overrides.promoCode === undefined ? defaults.promoCode : overrides.promoCode,
  };
}
