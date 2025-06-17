import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { DashboardPage } from '../../pages/user/dashboard.page';

test.describe('Authentication - Login', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('Successful login with phone number', async ({ page }) => {
    await loginPage.loginWithPhone('+251911223344', 'securePassword123');
    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.welcomeMessage).toContainText("Welcome to EarnMax Elite");
  });

  test('Successful login with email', async ({ page }) => {
    await loginPage.loginWithEmail('user@example.com', 'securePassword123');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Failed login with incorrect credentials', async ({ page }) => {
    await loginPage.loginWithPhone('+251911223344', 'wrongPassword');
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });

  test('Account lock after 5 failed attempts', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await loginPage.loginWithPhone('+251911223344', 'wrongPassword');
    }
    await expect(loginPage.accountLockedMessage).toBeVisible();
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('Login with 2FA enabled', async ({ page }) => {
    await loginPage.loginWithPhone('+251911223344', 'securePassword123');
    await loginPage.enter2FACode('654321');
    await expect(page).toHaveURL(/dashboard/);
  });
});