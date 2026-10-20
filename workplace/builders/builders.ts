export interface ShippingInput {
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutData {
  shipping: ShippingInput;
  items: CartItemInput[];
  promoCode: string | null;
}

export interface CheckoutOverrides {
  shipping?: Partial<ShippingInput>;
  items?: readonly CartItemInput[];
  promoCode?: string | null;
}

// Pure input construction: no network, random values, assertions, or shared
// mutable objects. Deterministic defaults make failures straightforward to read.
export function buildShipping(overrides: Partial<ShippingInput> = {}): ShippingInput {
  return { name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA', ...overrides };
}

export function buildCheckoutData(overrides: CheckoutOverrides = {}): CheckoutData {
  return {
    shipping: buildShipping(overrides.shipping),
    items: (overrides.items ?? [{ productId: 'p1', quantity: 1 }]).map(item => ({ ...item })),
    promoCode: overrides.promoCode === undefined ? null : overrides.promoCode,
  };
}
