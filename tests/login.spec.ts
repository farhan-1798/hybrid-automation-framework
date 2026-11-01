import { test, expect } from '../src/fixtures/testFixture.js';
import { getTestData } from '../src/utils/testDataLoader.js';

test.describe('Authentication Flows', () => {
  test('User should log in successfully with valid credentials', async ({ loginPage }) => {
    const validUser = getTestData('standard_user');

    await loginPage.open();
    await loginPage.login(validUser.username, validUser.password);
    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn).toBe(true);
  });

  test('User should see an error message when logging in with locked out user', async ({ loginPage }) => {
    const lockedUser = getTestData('locked_out_user');

    await loginPage.open();
    await loginPage.login(lockedUser.username, lockedUser.password);
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg.toLowerCase()).toContain('locked out');
  });
});
