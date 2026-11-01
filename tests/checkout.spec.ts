import { test, expect } from '../src/fixtures/testFixture.js';

test.describe('E-Commerce Purchase Flows', () => {
  test('User should complete an end-to-end purchase successfully', async ({
    loginPage,
    inventoryPage,
    checkoutPage,
  }) => {
    // 1. Authenticate
    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');
    expect(await loginPage.isLoggedIn()).toBe(true);

    // 2. Add item to cart
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBeGreaterThanOrEqual(1);

    // 3. Open cart and fill shipping details
    await inventoryPage.openCart();
    await checkoutPage.enterShippingDetails('John', 'Doe', '12345');

    // 4. Finish checkout and verify completion message
    await checkoutPage.finishCheckout();
    const confirmation = await checkoutPage.getConfirmationHeader();
    expect(confirmation.toLowerCase()).toContain('thank you');
  });
});

