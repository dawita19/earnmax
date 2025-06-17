import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { VIPPage } from '../../pages/user/vip.page';

test.describe('User - VIP System', () => {
  let loginPage: LoginPage;
  let vipPage: VIPPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    vipPage = new VIPPage(page);
    await loginPage.navigate();
    await loginPage.loginWithPhone('+251911223344', 'securePassword123');
    await vipPage.navigate();
  });

  test('Purchase VIP1 level', async ({ page }) => {
    await vipPage.selectVIPLevel(1);
    await vipPage.submitPurchaseRequest();
    
    // Verify payment proof upload
    await vipPage.uploadPaymentProof('tests/fixtures/payment-proof.jpg');
    await expect(vipPage.paymentProofPreview).toBeVisible();
    
    // Mock admin approval
    await vipPage.mockAdminApproval();
    
    await expect(vipPage.vipStatus).toHaveText('VIP 1');
    await expect(vipPage.dailyEarnings).toContainText('40.00');
  });

  test('Upgrade from VIP1 to VIP3 with sufficient balance', async ({ page }) => {
    // First purchase VIP1
    await vipPage.purchaseVIPLevel(1);
    
    // Add balance for upgrade
    await vipPage.mockAddBalance(5000.00);
    
    await vipPage.selectVIPLevel(3);
    const upgradeDetails = await vipPage.getUpgradeDetails();
    expect(upgradeDetails.difference).toBe(4800.00); // 6000 - 1200
    
    await vipPage.confirmUpgrade();
    await expect(vipPage.vipStatus).toHaveText('VIP 3');
    await expect(vipPage.currentBalance).toContainText('200.00'); // 5000 - 4800
  });

  test('Upgrade from VIP2 to VIP4 with insufficient balance', async ({ page }) => {
    // First purchase VIP2
    await vipPage.purchaseVIPLevel(2);
    
    await vipPage.selectVIPLevel(4);
    const upgradeDetails = await vipPage.getUpgradeDetails();
    expect(upgradeDetails.difference).toBe(9000.00); // 12000 - 3000
    
    await vipPage.confirmUpgrade();
    await expect(vipPage.paymentProofRequired).toBeVisible();
    
    // Complete partial payment
    await vipPage.uploadPaymentProof('tests/fixtures/payment-proof.jpg');
    await vipPage.enterPartialPayment(5000.00);
    await vipPage.submitUpgradeRequest();
    
    // Mock admin approval
    await vipPage.mockAdminApproval();
    
    await expect(vipPage.vipStatus).toHaveText('VIP 4');
    await expect(vipPage.currentBalance).toContainText('0.00'); // 4000 deducted from balance
  });

  test('Verify referral bonuses on VIP purchase', async ({ page, request }) => {
    // Setup referral network
    const inviter1 = await vipPage.createTestUser(request);
    const inviter2 = await vipPage.createTestUser(request, inviter1.inviteCode);
    const inviter3 = await vipPage.createTestUser(request, inviter2.inviteCode);
    
    // Login as level 3 user
    await loginPage.logout();
    await loginPage.loginWithPhone(inviter3.phoneNumber, 'testPassword');
    await vipPage.navigate();
    
    // Mock admin approval for clean test
    await vipPage.mockAutoApproval();
    
    // Purchase VIP1
    await vipPage.purchaseVIPLevel(1);
    
    // Verify bonuses
    const inviter1Response = await request.get(`/api/users/${inviter1.userId}/balance`);
    const inviter1Data = await inviter1Response.json();
    expect(inviter1Data.referralBonus).toBe(240.00); // 20% of 1200
    
    const inviter2Response = await request.get(`/api/users/${inviter2.userId}/balance`);
    const inviter2Data = await inviter2Response.json();
    expect(inviter2Data.referralBonus).toBe(120.00); // 10% of 1200
    
    const inviter3Response = await request.get(`/api/users/${inviter3.userId}/balance`);
    const inviter3Data = await inviter3Response.json();
    expect(inviter3Data.referralBonus).toBe(60.00); // 5% of 1200
  });
});