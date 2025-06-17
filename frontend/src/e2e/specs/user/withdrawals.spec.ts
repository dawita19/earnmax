import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { WithdrawalPage } from '../../pages/user/withdrawal.page';

test.describe('User - Withdrawals', () => {
  let loginPage: LoginPage;
  let withdrawalPage: WithdrawalPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    withdrawalPage = new WithdrawalPage(page);
    await loginPage.navigate();
    await loginPage.loginWithPhone('+251911223344', 'securePassword123');
    await withdrawalPage.navigate();
  });

  test('Successful withdrawal request for VIP1', async ({ page }) => {
    // Setup VIP1 with balance
    await withdrawalPage.mockVIPLevel(1);
    await withdrawalPage.mockBalance(2000.00);
    
    await withdrawalPage.requestWithdrawal(1000.00);
    await expect(withdrawalPage.successMessage).toContainText('Request submitted');
    
    // Mock admin approval
    await withdrawalPage.mockAdminApproval();
    
    await expect(withdrawalPage.currentBalance).toContainText('1000.00');
    await expect(withdrawalPage.withdrawalHistory).toContainText('1000.00');
  });

  test('Withdrawal fails below VIP level minimum', async ({ page }) => {
    await withdrawalPage.mockVIPLevel(2);
    await withdrawalPage.mockBalance(2000.00);
    
    await withdrawalPage.requestWithdrawal(50.00);
    await expect(withdrawalPage.errorMessage).toContainText('Minimum withdrawal: 100.00');
  });

  test('VIP0 reaches maximum withdrawal limit', async ({ page }) => {
    await withdrawalPage.mockVIPLevel(0);
    await withdrawalPage.mockTotalWithdrawn(300.00);
    await withdrawalPage.mockBalance(100.00);
    
    await withdrawalPage.requestWithdrawal(60.00);
    await expect(withdrawalPage.upgradePrompt).toBeVisible();
  });

  test('VIP3 reaches maximum total withdrawal', async ({ page }) => {
    await withdrawalPage.mockVIPLevel(3);
    await withdrawalPage.mockTotalWithdrawn(23000.00);
    await withdrawalPage.mockBalance(2000.00);
    
    await withdrawalPage.requestWithdrawal(1000.00);
    await expect(withdrawalPage.upgradePrompt).toBeVisible();
    
    // Test upgrade flow from withdrawal
    await withdrawalPage.startUpgradeFromPrompt();
    await withdrawalPage.selectVIPLevel(4);
    await withdrawalPage.completeUpgrade();
    
    // Verify can now withdraw
    await withdrawalPage.requestWithdrawal(1000.00);
    await expect(withdrawalPage.successMessage).toContainText('Request submitted');
  });

  test('Withdrawal with 2FA verification', async ({ page }) => {
    await withdrawalPage.mockVIPLevel(2);
    await withdrawalPage.mockBalance(5000.00);
    await withdrawalPage.enable2FA();
    
    await withdrawalPage.requestWithdrawal(1000.00);
    await withdrawalPage.enter2FACode('654321');
    
    await expect(withdrawalPage.successMessage).toContainText('Request submitted');
  });
});