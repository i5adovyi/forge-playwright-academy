export interface ShippingInput {
  name: string;
  address: string;
  city: string;
  postalCode: string;
}
export interface CartItemInput { productId: string; quantity: number }
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

export function buildShipping(overrides: Partial<ShippingInput> = {}): ShippingInput {
  // TODO: fresh deterministic valid values, with caller overrides.
  throw new Error('DB-01: implement a fresh typed shipping builder');
}

export function buildCheckoutData(overrides: CheckoutOverrides = {}): CheckoutData {
  // TODO: independently owned shipping, item array, and each item object.
  // A top-level {...defaults} leaves nested objects shared.
  throw new Error('DB-01: implement checkout data with no shared nested references');
}
