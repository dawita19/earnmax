import './auth';
import './vip';
import './commands';

// Global test hooks
beforeEach(() => {
  // Reset test data
  cy.task('resetTestData');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      adminLogin(level: 'high' | 'low'): Chainable<void>;
      userLogin(phone: string, password?: string): Chainable<void>;
      processPurchaseRequest(userId: number, amount: number, action: 'approved' | 'rejected'): Chainable<void>;
      completeTask(vipLevel: number, taskType: string): Chainable<void>;
      verifyReferralBonus(inviterId: number, levelsToCheck: number): Chainable<void>;
    }
  }
}

// Database task types
declare namespace Cypress {
  interface Tasks {
    insertUser(user: any): Promise<number>;
    deleteUser(userId: number): Promise<void>;
    insertAdmin(admin: any): Promise<number>;
    deleteAdmin(adminId: number): Promise<void>;
    insertPurchaseRequest(request: any): Promise<number>;
    deletePurchaseRequest(requestId: number): Promise<void>;
    queryDb(query: string): Promise<any>;
    resetTestData(): Promise<void>;
  }
}