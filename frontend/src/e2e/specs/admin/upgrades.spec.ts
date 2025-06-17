describe('VIP Upgrade Management', () => {
  before(() => {
    cy.loginLowLevelAdmin();
    cy.visit('/admin/upgrades');
  });

  it('should process balance-sufficient upgrades automatically', () => {
    cy.get('[data-testid="auto-upgrade-row"]').first().within(() => {
      cy.get('[data-testid="current-level"]').then(($current) => {
        const currentLevel = parseInt($current.text());
        cy.get('[data-testid="new-level"]').should('contain', currentLevel + 1);
        cy.get('[data-testid="approve-btn"]').click();
        
        cy.get('.toast-success').should('contain', 'Upgrade processed');
        cy.assertUserVipLevelUpdated(currentLevel + 1);
      });
    });
  });

  it('should handle balance-insufficient upgrades with proof', () => {
    cy.get('[data-testid="manual-upgrade-row"]').first().within(() => {
      cy.get('[data-testid="view-proof"]').click();
      cy.get('[data-testid="approve-btn"]').click();
      
      cy.get('.toast-success').should('contain', 'Upgrade approved');
      cy.get('[data-testid="loan-updated"]').should('contain', 'Yes');
    });
  });

  it('should validate upgrade amount calculations', () => {
    cy.get('[data-testid="upgrade-row-5"]').within(() => {
      cy.get('[data-testid="current-amount"]').then(($current) => {
        const currentAmount = parseFloat($current.text().replace('Birr', ''));
        cy.get('[data-testid="new-amount"]').then(($new) => {
          const newAmount = parseFloat($new.text().replace('Birr', ''));
          cy.get('[data-testid="difference"]').should('contain', (newAmount - currentAmount).toFixed(2));
        });
      });
    });
  });

  it('should update loan records on upgrade', () => {
    cy.get('[data-testid="upgrade-row-7"]').then(($row) => {
      const userId = $row.attr('data-user-id');
      const upgradeAmount = parseFloat($row.find('[data-testid="difference"]').text());
      
      cy.get('[data-testid="approve-btn"]').click();
      cy.assertLoanUpdated(userId, upgradeAmount);
    });
  });
});