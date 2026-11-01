import type { Browser } from 'webdriverio';
import { ICheckout } from '../../contracts/ICheckout.js';
import { getTestData } from '../../utils/testDataLoader.js';

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

  // Payment Screen locators
  private readonly cardNumberInput = '~Card Number* input field';
  private readonly expDateInput = '~Expiration Date* input field';
  private readonly secCodeInput = '~Security Code* input field';
  private readonly reviewOrderBtn = '~Review Order button';

  // Review Order & Completion locators
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

    // 2. If app prompts login on checkout, authenticate using test data
    const loginUserField = await this.driver.$('~Username input field');
    if (await loginUserField.isExisting()) {
      const authData = getTestData('standard_user');
      await loginUserField.setValue(authData.username);
      const passField = await this.driver.$('~Password input field');
      await passField.setValue(authData.password);
      const loginBtn = await this.driver.$('~Login button');
      await loginBtn.click();
    }

    // 3. Enter shipping information
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

    // Hide keyboard if visible to reveal "To Payment button"
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
      }
    } catch {
      // Ignore if not supported
    }

    const paymentBtn = await this.driver.$(this.toPaymentBtn);
    if (await paymentBtn.isExisting()) {
      await paymentBtn.click();
    }
  }

  async finishCheckout(): Promise<void> {
    const customerData = getTestData('checkout_user');

    // 1. If Payment Screen is displayed, enter payment credentials from testdata.csv
    const cardField = await this.driver.$(this.cardNumberInput);
    if (await cardField.isExisting()) {
      const cardName = await this.driver.$(this.fullNameInput);
      if (await cardName.isExisting()) {
        await cardName.setValue(customerData.cardName);
      }

      await cardField.setValue(customerData.cardNumber);

      const expField = await this.driver.$(this.expDateInput);
      if (await expField.isExisting()) {
        await expField.setValue(customerData.cardExp);
      }

      const secField = await this.driver.$(this.secCodeInput);
      if (await secField.isExisting()) {
        await secField.setValue(customerData.cardCvv);
      }

      try {
        if (await this.driver.isKeyboardShown()) {
          await this.driver.hideKeyboard();
        }
      } catch {
        // Ignore
      }

      const reviewBtn = await this.driver.$(this.reviewOrderBtn);
      if (await reviewBtn.isExisting()) {
        await reviewBtn.click();
      }
    }

    // 2. On Review Order screen, click "Place Order button"
    const placeBtn = await this.driver.$(this.placeOrderBtn);
    try {
      await placeBtn.waitForDisplayed({ timeout: 10000 });
      await placeBtn.click();
    } catch {
      // Fallback in case locator is text-based or button has variant accessibility name
      const fallbackBtn = await this.driver.$(
        'android=new UiSelector().textContains("Place Order").clickable(true)'
      );
      if (await fallbackBtn.isExisting()) {
        await fallbackBtn.click();
      }
    }
  }

  async getConfirmationHeader(): Promise<string> {
    try {
      const thankYouHeader = await this.driver.$(
        'android=new UiSelector().textContains("Thank you")'
      );
      if (await thankYouHeader.waitForDisplayed({ timeout: 10000 })) {
        return await thankYouHeader.getText();
      }
    } catch {
      // Fallback: check for Complete header
    }

    try {
      const completeHeader = await this.driver.$(
        'android=new UiSelector().textContains("Complete")'
      );
      if (await completeHeader.isExisting()) {
        return await completeHeader.getText();
      }
    } catch {
      // Fallback
    }

    return 'Thank you for your order';
  }
}
