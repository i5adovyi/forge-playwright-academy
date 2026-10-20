import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

// These objects own locators and user actions. The fixture owns the Page;
// the spec owns product choices, independent expected amounts, and assertions.
export class ProductCard {
  readonly root: Locator;
  constructor(private readonly page: Page, readonly name: string) {
    this.root = page.getByRole('article', { name, exact: true });
  }

  async add(): Promise<Response> {
    const response = this.page.waitForResponse(incoming =>
      new URL(incoming.url()).pathname === '/api/cart'
      && incoming.request().method() === 'POST');
    await this.root.getByRole('button', { name: `Add ${this.name} to cart`, exact: true }).click();
    return response;
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
    return this.root.getByLabel(`Quantity for ${productName}`, { exact: true });
  }

  async setQuantity(productName: string, value: number): Promise<Response> {
    const response = this.page.waitForResponse(incoming =>
      new URL(incoming.url()).pathname === '/api/cart'
      && incoming.request().method() === 'POST');
    const quantity = this.quantity(productName);
    await quantity.fill(String(value));
    await quantity.press('Tab');
    return response;
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
    await this.page.goto('/lab/');
    // A readiness assertion can live here. Business amounts stay in the spec.
    await expect(this.page.getByRole('heading', { name: 'Good tools. Great work.' })).toBeVisible();
  }

  product(name: string): ProductCard {
    return new ProductCard(this.page, name);
  }

  async openCart(): Promise<CartPanel> {
    await this.cartButton.click();
    const cart = new CartPanel(this.page);
    await expect(cart.root).toBeVisible();
    return cart;
  }
}
