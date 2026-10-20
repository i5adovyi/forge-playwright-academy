import type { Locator, Page, Response } from '@playwright/test';

export class ProductCard {
  readonly root: Locator;
  constructor(private readonly page: Page, readonly name: string) {
    // TODO: scope by the exact accessible name, not text matching or nth().
    this.root = page.getByRole('article', { name, exact: true });
  }
  async add(): Promise<Response> {
    // TODO: register response observation before clicking the scoped button.
    throw new Error('RF-01: implement ProductCard.add');
  }
}

export class CartPanel {
  readonly root: Locator;
  readonly total: Locator;
  constructor(private readonly page: Page) {
    this.root = page.getByRole('dialog', { name: 'Your cart', exact: true });
    this.total = this.root.getByTestId('cart-total');
  }
  quantity(productName: string): Locator {
    throw new Error(`RF-02: locate quantity for ${productName}`);
  }
  async setQuantity(productName: string, value: number): Promise<Response> {
    // TODO: observe POST /api/cart, fill, and commit through a real user action.
    throw new Error(`RF-02: implement quantity change for ${productName}: ${value}`);
  }
}

export class ShopPage {
  readonly category: Locator;
  readonly cartButton: Locator;
  constructor(readonly page: Page) {
    this.category = page.getByLabel('Category', { exact: true });
    this.cartButton = page.getByRole('button', { name: /^Cart \(/ });
  }
  async goto(): Promise<void> {
    throw new Error('RF-01: implement navigation and page readiness');
  }
  product(name: string): ProductCard {
    return new ProductCard(this.page, name);
  }
  async openCart(): Promise<CartPanel> {
    throw new Error('RF-01: open and return a ready CartPanel');
  }
}
