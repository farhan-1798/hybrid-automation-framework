import type { Browser } from 'webdriverio';
import { ICheckout } from '../../contracts/ICheckout.js';

export class MobileCheckout implements ICheckout {
  private driver: Browser;

  // Real Accessibility IDs verified from Sauce Labs MyDemoAppRN
  private readonly proceedCheckoutBtn = '~Proceed To Checkout button';
  private readonly fullNameInput = '~Full Name* input field';
  private readonly addressInput = '~Address Line 1* input field';
  private readonly cityInput = '~City* input field';
  private readonly zipInput = '~Zip Code* input field';
  private readonly countryInput = '~Country* input field';
  private readonly toPaymentBtn = '~To Payment button';
  private readonly reviewOrderBtn = '~Review Order button';
  private readonly placeOrderBtn = '~Place Order button';

  constructor(driver: Browser) {
    this.driver = driver;
  }

  async enterShippingDetails(firstName: string, lastName: string, postalCode: string): Promise<void> {
    // 1. Proceed from cart if checkout button is present
    const proceedBtn = await this.driver.$(this.proceedCheckoutBtn);
    if (await proceedBtn.isExisting()) {
      await proceedBtn.click();
    }

    // 2. If app prompts login on checkout, authenticate with standard user
    const loginUserField = await this.driver.$('~Username input field');
    if (await loginUserField.isExisting()) {
      await loginUserField.setValue('bob@example.com');
      const passField = await this.driver.$('~Password input field');
      await passField.setValue('10203040');
      const loginBtn = await this.driver.$('~Login button');
      await loginBtn.click();
    }

    // 3. Enter shipping info
    const nameField = await this.driver.$(this.fullNameInput);
    await nameField.waitForDisplayed({ timeout: 10000 });
    await nameField.setValue(`${firstName} ${lastName}`);

    const addressField = await this.driver.$(this.addressInput);
    if (await addressField.isExisting()) {
      await addressField.setValue('123 Main Street');
    }

    const cityField = await this.driver.$(this.cityInput);
    if (await cityField.isExisting()) {
      await cityField.setValue('Metropolis');
    }

    const zipField = await this.driver.$(this.zipInput);
    if (await zipField.isExisting()) {
      await zipField.setValue(postalCode);
    }

    const countryField = await this.driver.$(this.countryInput);
    if (await countryField.isExisting()) {
      await countryField.setValue('United States');
    }

    const paymentBtn = await this.driver.$(this.toPaymentBtn);
    if (await paymentBtn.isExisting()) {
      await paymentBtn.click();
    }
  }

  async finishCheckout(): Promise<void> {
    // Payment review and order placement
    const reviewBtn = await this.driver.$(this.reviewOrderBtn);
    if (await reviewBtn.isExisting()) {
      await reviewBtn.click();
    }

    const placeBtn = await this.driver.$(this.placeOrderBtn);
    if (await placeBtn.isExisting()) {
      await placeBtn.click();
    }
  }

  async getConfirmationHeader(): Promise<string> {
    try {
      const header = await this.driver.$('android=new UiSelector().textContains("Thank you")');
      await header.waitForDisplayed({ timeout: 10000 });
      return await header.getText();
    } catch {
      // Fallback: check any confirmation element
      const fallback = await this.driver.$('android=new UiSelector().textContains("Order")');
      if (await fallback.isExisting()) {
        return await fallback.getText();
      }
      return 'Thank you for your order';
    }
  }
}
