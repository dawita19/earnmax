/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as admin
       * @example cy.adminLogin('high')
       */
      adminLogin(level: 'high' | 'low'): Chainable<void>
      
      /**
       * Custom command to login as user
       * @example cy.userLogin('+251911223344')
       */
      userLogin(phone: string, password?: string): Chainable<void>
      
      /**
       * Process VIP purchase request
       * @example cy.processPurchaseRequest(1, 1200, 'approved')
       */
      processPurchaseRequest(userId: number, amount: number, action: 'approved' | 'rejected'): Chainable<void>
      
      /**
       * Complete daily task
       * @example cy.completeTask(2, 'click_ad')
       */
      completeTask(vipLevel: number, taskType: string): Chainable<void>
      
      /**
       * Verify referral bonuses
       * @example cy.verifyReferralBonus(123, 4)
       */
      verifyReferralBonus(inviterId: number, levelsToCheck: number): Chainable<void>
    }
  }
}

Cypress.Commands.add('adminLogin', (level) => {
  const username = level === 'high' 
    ? Cypress.env('HIGH_ADMIN_USER') 
    : Cypress.env('LOW_ADMIN_USER');
  const password = level === 'high' 
    ? Cypress.env('HIGH_ADMIN_PASS') 
    : Cypress.env('LOW_ADMIN_PASS');

  cy.session([username, password], () => {
    cy.visit('/admin/login');
    cy.get('[data-testid="admin-username"]').type(username);
    cy.get('[data-testid="admin-password"]').type(password, { log: false });
    cy.get('[data-testid="admin-login-btn"]').click();
    cy.url().should('include', '/admin/dashboard');
    cy.contains(`Welcome ${level === 'high' ? 'boss' : 'management team'}`).should('exist');
  });
});

Cypress.Commands.add('userLogin', (phone, password = 'defaultPassword') => {
  cy.session([phone, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="login-phone"]').type(phone);
    cy.get('[data-testid="login-password"]').type(password, { log: false });
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to EarnMax Elite').should('exist');
  });
});

Cypress.Commands.add('processPurchaseRequest', (userId, amount, action) => {
  cy.adminLogin('low');
  
  cy.get('[data-testid="purchase-requests-tab"]').click();
  cy.get(`[data-testid="purchase-request-${userId}"]`).within(() => {
    cy.contains(amount.toFixed(2)).should('exist');
    
    if (action === 'approved') {
      cy.get('[data-testid="approve-btn"]').click();
      cy.get('[data-testid="approval-confirm"]').click();
    } else {
      cy.get('[data-testid="reject-btn"]').click();
      cy.get('[data-testid="rejection-reason"]').type('Invalid payment proof');
      cy.get('[data-testid="rejection-confirm"]').click();
    }
  });
  
  // Verify status update
  cy.get(`[data-testid="purchase-request-${userId}"]`)
    .should('contain', action === 'approved' ? 'Approved' : 'Rejected');
});

Cypress.Commands.add('completeTask', (vipLevel, taskType) => {
  cy.get(`[data-testid="vip-${vipLevel}-tasks"]`).within(() => {
    cy.get(`[data-testid="task-${taskType}"]`).click();
    cy.get(`[data-testid="task-${taskType}-complete"]`).should('exist');
  });
  
  // Verify balance update
  const taskEarnings = {
    0: 5.00, 1: 10.00, 2: 25.00, 3: 50.00,
    4: 100.00, 5: 175.00, 6: 275.00, 7: 500.00, 8: 1000.00
  };
  
  cy.get('[data-testid="current-balance"]').then(($balance) => {
    const currentBalance = parseFloat($balance.text().replace(/[^0-9.]/g, ''));
    const expectedBalance = currentBalance + taskEarnings[vipLevel];
    
    cy.get('[data-testid="current-balance"]').should('contain', expectedBalance.toFixed(2));
  });
});

Cypress.Commands.add('verifyReferralBonus', (inviterId, levelsToCheck) => {
  const bonusPercentages = [0.2, 0.1, 0.05, 0.02];
  
  cy.task('queryDb', `SELECT * FROM users WHERE user_id = ${inviterId}`).then((inviter: any) => {
    const originalBonus = parseFloat(inviter.total_referral_bonus);
    
    // Check each level
    for (let level = 1; level <= levelsToCheck; level++) {
      cy.task('queryDb', 
        `SELECT * FROM referral_bonuses 
         WHERE inviter_id = ${inviterId} AND level = ${level} 
         ORDER BY created_at DESC LIMIT 1`
      ).then((latestBonus: any) => {
        expect(latestBonus).to.not.be.null;
        
        const expectedBonus = latestBonus.amount * bonusPercentages[level - 1];
        const newTotal = originalBonus + expectedBonus;
        
        cy.task('queryDb', 
          `SELECT total_referral_bonus FROM users WHERE user_id = ${inviterId}`
        ).then((updatedUser: any) => {
          expect(parseFloat(updatedUser.total_referral_bonus)).to.be.closeTo(newTotal, 0.01);
        });
      });
    }
  });
});