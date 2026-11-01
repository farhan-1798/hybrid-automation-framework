import { test, expect } from '../src/fixtures/testFixture.js';

test.describe('Authentication Flows', () => {
  test('User should log in successfully with valid credentials', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');
    const loggedIn = await loginPage.isLoggedIn();
    expect(loggedIn).toBe(true);
  });

  test('User should see an error message when logging in with locked out user', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('locked_out_user', 'secret_sauce');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg.toLowerCase()).toContain('locked out');
  });
});

