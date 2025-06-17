describe('Withdrawal Request Processing', () => {
  beforeEach(() => {
    cy.loginLowLevelAdmin();
    cy.visit('/admin/withdrawals');
    cy.intercept('POST', '/api/withdrawals/*/approve').as('approveWithdrawal');
  });

  it('should enforce VIP withdrawal limits', () => {
    cy.get('[data-testid="withdrawal-row-1"]').within(() => {
      cy.get('[data-testid="vip-level"]').then(($vip) => {
        const vipLevel = parseInt($vip.text());
        cy.get('[data-testid="amount"]').then(($amount) => {
          const amount = parseFloat($amount.text().replace('Birr', ''));
          cy.get('[data-testid="min-withdrawal"]').should('contain', Cypress.env(`vip${vipLevel}_min_withdrawal`));
          
          if (amount > Cypress.env(`vip${vipLevel}_max_withdrawal`)) {
            cy.get('[data-testid="reject-btn"]').should('be.disabled');
            cy.get('[data-testid="approve-btn"]').should('be.disabled');
            cy.get('[data-testid="status"]').should('contain', 'Requires Upgrade');
          }
        });
      });
    });
  });

  it('should process valid withdrawals', () => {
    cy.get('[data-testid="withdrawal-row-3"]').within(() => {
      cy.get('[data-testid="user-balance"]').then(($balance) => {
        const balance = parseFloat($balance.text());
        cy.get('[data-testid="amount"]').then(($amount) => {
          const amount = parseFloat($amount.text());
          
          if (amount <= balance) {
            cy.get('[data-testid="approve-btn"]').click();
            cy.wait('@approveWithdrawal').its('response.statusCode').should('eq', 200);
            cy.get('[data-testid="status"]').should('contain', 'Approved');
          }
        });
      });
    });
  });

  it('should update user balance and totals', () => {
    cy.get('[data-testid="withdrawal-row-4"]').then(($row) => {
      const userId = $row.attr('data-user-id');
      const amount = parseFloat($row.find('[data-testid="amount"]').text());
      
      cy.get('[data-testid="approve-btn"]').click();
      cy.assertUserBalanceUpdated(userId, -amount);
      cy.assertWithdrawalTotalUpdated(userId, amount);
    });
  });

  it('should prevent duplicate withdrawals', () => {
    cy.get('[data-testid="withdrawal-row-5"]').within(() => {
      cy.get('[data-testid="approve-btn"]').click();
    });
    
    cy.get('[data-testid="withdrawal-row-5"] [data-testid="approve-btn"]').should('not.exist');
    cy.get('[data-testid="withdrawal-row-5"] [data-testid="status"]').should('contain', 'Approved');
  });
});