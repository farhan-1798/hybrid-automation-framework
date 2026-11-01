import { test, expect } from '../src/fixtures/testFixture.js';
import { getTestData } from '../src/utils/testDataLoader.js';

test.describe('E-Commerce Purchase Flows', () => {
  test('User should complete an end-to-end purchase successfully', async ({
    loginPage,
    inventoryPage,
    checkoutPage,
  }) => {
    const authUser = getTestData('standard_user');
    const customer = getTestData('checkout_user');

    // 1. Authenticate using credentials from testdata.csv
    await loginPage.open();
    await loginPage.login(authUser.username, authUser.password);
    expect(await loginPage.isLoggedIn()).toBe(true);

    // 2. Add item to cart
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBeGreaterThanOrEqual(1);

    // 3. Open cart and fill shipping details from testdata.csv
    await inventoryPage.openCart();
    await checkoutPage.enterShippingDetails(customer.firstName, customer.lastName, customer.postalCode);

    // 4. Finish checkout and verify completion message
    await checkoutPage.finishCheckout();
    const confirmation = await checkoutPage.getConfirmationHeader();
    expect(confirmation.toLowerCase()).toMatch(/thank you|complete/);
  });
});
