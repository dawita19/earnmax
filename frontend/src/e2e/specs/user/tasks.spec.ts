import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { TasksPage } from '../../pages/user/tasks.page';

test.describe('User - Daily Tasks', () => {
  let loginPage: LoginPage;
  let tasksPage: TasksPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    tasksPage = new TasksPage(page);
    await loginPage.navigate();
    await loginPage.loginWithPhone('+251911223344', 'securePassword123');
    await tasksPage.navigate();
  });

  test('Complete all daily tasks for VIP0', async ({ page }) => {
    const initialBalance = await tasksPage.getCurrentBalance();
    
    await tasksPage.completeTask('View Ad');
    await expect(tasksPage.taskCompletionToast).toContainText('+5.00');
    
    await tasksPage.completeTask('Spin Reward');
    await tasksPage.completeTask('Share Post');
    await tasksPage.completeTask('Watch Video');
    
    const finalBalance = await tasksPage.getCurrentBalance();
    expect(finalBalance).toBe(initialBalance + 20.00); // 4 tasks x 5.00
    
    await expect(tasksPage.allTasksCompleted).toBeVisible();
  });

  test('Tasks reset after 24 hours', async ({ page }) => {
    // Complete all tasks first
    await tasksPage.completeAllTasks();
    
    // Mock time passage
    await page.evaluate(() => {
      const now = new Date();
      now.setHours(now.getHours() + 25);
      Date.now = () => now.getTime();
    });
    
    await page.reload();
    await expect(tasksPage.taskList).toHaveCount(4);
    await expect(tasksPage.completedTasks).toHaveCount(0);
  });

  test('Referral bonuses from task completion', async ({ page, request }) => {
    // Setup referral network
    const inviter1 = await tasksPage.createTestUser(request);
    const inviter2 = await tasksPage.createTestUser(request, inviter1.inviteCode);
    
    // Login as level 2 user
    await loginPage.logout();
    await loginPage.loginWithPhone(inviter2.phoneNumber, 'testPassword');
    await tasksPage.navigate();
    
    // Complete task and verify bonuses
    const initialBalance = await tasksPage.getCurrentBalance();
    await tasksPage.completeTask('View Ad');
    
    // Verify inviter1 (level 1) got 20% bonus
    const inviter1Response = await request.get(`/api/users/${inviter1.userId}/balance`);
    const inviter1Balance = (await inviter1Response.json()).balance;
    expect(inviter1Balance).toBe(1.00); // 20% of 5.00
    
    // Verify inviter2 (level 2) got 10% bonus
    const inviter2Response = await request.get(`/api/users/${inviter2.userId}/balance`);
    const inviter2Balance = (await inviter2Response.json()).balance;
    expect(inviter2Balance).toBe(0.50); // 10% of 5.00
  });

  test('VIP-specific tasks availability', async ({ page }) => {
    // Upgrade user to VIP1 first
    await tasksPage.upgradeToVIP(1);
    
    await page.reload();
    await expect(tasksPage.taskList).toHaveCount(4);
    await expect(tasksPage.taskList).toContainText(['Click ad', 'Comment on promo']);
  });
});