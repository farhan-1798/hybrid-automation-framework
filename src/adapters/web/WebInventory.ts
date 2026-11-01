import { Page } from '@playwright/test';
import { IInventory } from '../../contracts/IInventory.js';

export class WebInventory implements IInventory {
  private page: Page;

  // Web locators
  private readonly cartLink = '.shopping_cart_link';
  private readonly cartBadge = '.shopping_cart_badge';
  private readonly itemCard = '.inventory_item';
  private readonly itemTitle = '.inventory_item_name';
  private readonly itemPrice = '.inventory_item_price';

  constructor(page: Page) {
    this.page = page;
  }

  private getItemCardLocator(productName: string) {
    return this.page.locator(this.itemCard).filter({
      has: this.page.locator(this.itemTitle, { hasText: productName }),
    });
  }

  async addItemToCart(productName: string): Promise<void> {
    const card = this.getItemCardLocator(productName);
    await card.locator('button:has-text("Add to cart")').click();
  }

  async removeItemFromCart(productName: string): Promise<void> {
    const card = this.getItemCardLocator(productName);
    await card.locator('button:has-text("Remove")').click();
  }

  async getCartBadgeCount(): Promise<number> {
    const badge = this.page.locator(this.cartBadge);
    if ((await badge.count()) === 0) {
      return 0;
    }
    const text = await badge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async openCart(): Promise<void> {
    await this.page.click(this.cartLink);
  }

  async getItemPrice(productName: string): Promise<string> {
    const card = this.getItemCardLocator(productName);
    const priceText = await card.locator(this.itemPrice).textContent();
    return priceText ? priceText.trim() : '';
  }
}

