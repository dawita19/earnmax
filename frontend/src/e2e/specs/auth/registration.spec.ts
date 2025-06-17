import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/auth/registration.page';
import { DashboardPage } from '../../pages/user/dashboard.page';

test.describe('Authentication - Registration', () => {
  let registrationPage: RegistrationPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    dashboardPage = new DashboardPage(page);
    await registrationPage.navigate();
  });

  test('Successful registration with valid invitation code', async ({ page }) => {
    const phoneNumber = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
    await registrationPage.registerUser({
      fullName: 'Test User',
      phoneNumber,
      email: `test${Math.random().toString(36).substring(2, 8)}@example.com`,
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: 'VALID123'
    });
    
    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.vipBadge).toHaveText('VIP 0');
  });

  test('Registration fails with existing phone number', async ({ page }) => {
    await registrationPage.registerUser({
      fullName: 'Test User',
      phoneNumber: '+251911223344', // Already exists
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: 'VALID123'
    });
    
    await expect(registrationPage.errorMessage).toContainText('Phone number already registered');
  });

  test('Registration fails with invalid invitation code', async ({ page }) => {
    await registrationPage.registerUser({
      fullName: 'Test User',
      phoneNumber: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: 'INVALID123'
    });
    
    await expect(registrationPage.errorMessage).toContainText('Invalid invitation code');
  });

  test('Verify 4-level referral network creation', async ({ page, request }) => {
    // Test setup - create inviter chain
    const inviter1 = await registrationPage.createTestUser(request);
    const inviter2 = await registrationPage.createTestUser(request, inviter1.inviteCode);
    const inviter3 = await registrationPage.createTestUser(request, inviter2.inviteCode);
    const inviter4 = await registrationPage.createTestUser(request, inviter3.inviteCode);
    
    // Actual test registration
    const newUserPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
    await registrationPage.registerUser({
      fullName: 'Referral Test',
      phoneNumber: newUserPhone,
      email: `referral${Math.random().toString(36).substring(2, 8)}@example.com`,
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: inviter4.inviteCode
    });
    
    // Verify referral network
    const response = await request.get(`/api/users/${inviter1.userId}/referrals`);
    expect(response.status()).toBe(200);
    const referrals = await response.json();
    expect(referrals.firstLevel).toContainEqual(expect.objectContaining({
      phoneNumber: inviter2.phoneNumber
    }));
  });
});