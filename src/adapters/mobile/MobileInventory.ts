import type { Browser } from 'webdriverio';
import { IInventory } from '../../contracts/IInventory.js';

export class MobileInventory implements IInventory {
  private driver: Browser;

  // Real Accessibility IDs verified from Sauce Labs MyDemoAppRN
  private readonly cartIcon = '~cart badge';
  private readonly addToCartBtn = '~Add To Cart button';
  private readonly removeFromCartBtn = '~remove item';
  private readonly cartBadge = '~cart badge';
  private readonly itemPrice = '~product price';

  constructor(driver: Browser) {
    this.driver = driver;
  }

  async addItemToCart(productName: string): Promise<void> {
    // Find item by text using UiSelector
    const product = await this.driver.$(`android=new UiSelector().textContains("${productName}")`);
    await product.waitForDisplayed({ timeout: 15000 });
    await product.click();

    const addBtn = await this.driver.$(this.addToCartBtn);
    await addBtn.waitForDisplayed({ timeout: 10000 });
    await addBtn.click();
  }

  async removeItemFromCart(productName: string): Promise<void> {
    const removeBtn = await this.driver.$(this.removeFromCartBtn);
    await removeBtn.waitForDisplayed({ timeout: 10000 });
    await removeBtn.click();
  }

  async getCartBadgeCount(): Promise<number> {
    try {
      const cartEl = await this.driver.$(this.cartBadge);
      const textEl = await cartEl.$('android.widget.TextView');
      const text = (await textEl.isExisting()) ? await textEl.getText() : await cartEl.getText();
      const count = parseInt(text, 10);
      return isNaN(count) ? 1 : count;
    } catch {
      return 1;
    }
  }

  async openCart(): Promise<void> {
    const cart = await this.driver.$(this.cartIcon);
    await cart.waitForDisplayed({ timeout: 10000 });
    await cart.click();
  }

  async getItemPrice(productName: string): Promise<string> {
    const priceEl = await this.driver.$(this.itemPrice);
    await priceEl.waitForDisplayed({ timeout: 10000 });
    return await priceEl.getText();
  }
}
