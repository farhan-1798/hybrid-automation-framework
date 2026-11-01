import { Page } from '@playwright/test';
import { ICheckout } from '../../contracts/ICheckout.js';

export class WebCheckout implements ICheckout {
  private page: Page;

  // Web locators
  private readonly checkoutButton = '[data-test="checkout"]';
  private readonly firstNameInput = '[data-test="firstName"]';
  private readonly lastNameInput = '[data-test="lastName"]';
  private readonly postalCodeInput = '[data-test="postalCode"]';
  private readonly continueButton = '[data-test="continue"]';
  private readonly finishButton = '[data-test="finish"]';
  private readonly completeHeader = '[data-test="complete-header"]';

  constructor(page: Page) {
    this.page = page;
  }

  async enterShippingDetails(firstName: string, lastName: string, postalCode: string): Promise<void> {
    const checkoutBtn = this.page.locator(this.checkoutButton);
    if ((await checkoutBtn.count()) > 0 && (await checkoutBtn.isVisible())) {
      await checkoutBtn.click();
    }

    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.lastNameInput, lastName);
    await this.page.fill(this.postalCodeInput, postalCode);
    await this.page.click(this.continueButton);
  }

  async finishCheckout(): Promise<void> {
    await this.page.click(this.finishButton);
  }

  async getConfirmationHeader(): Promise<string> {
    const header = this.page.locator(this.completeHeader);
    await header.waitFor({ state: 'visible', timeout: 5000 });
    return (await header.textContent()) || '';
  }
}
