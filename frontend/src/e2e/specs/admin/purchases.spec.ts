describe('Purchase Request Management', () => {
  beforeEach(() => {
    cy.loginLowLevelAdmin();
    cy.visit('/admin/purchases');
  });

  it('should display purchase requests in round-robin distribution', () => {
    cy.get('[data-testid="purchase-requests"] tbody tr').should('have.length', 10);
    cy.checkRequestDistribution('purchase');
  });

  it('should approve valid purchase requests', () => {
    cy.fixture('paymentProof.png', 'base64').then((proof) => {
      cy.get('[data-testid="purchase-row-1"]').within(() => {
        cy.get('[data-testid="view-proof"]').click();
        cy.get('.proof-image').should('have.attr', 'src').should('include', 'data:image');
        cy.get('[data-testid="approve-btn"]').click();
      });
      
      cy.get('.toast-success').should('contain', 'Purchase approved');
      cy.get('[data-testid="purchase-row-1"]').should('not.exist');
    });
  });

  it('should reject suspicious purchases', () => {
    cy.get('[data-testid="purchase-row-2"]').within(() => {
      cy.get('[data-testid="reject-btn"]').click();
      cy.get('[data-testid="reject-reason"]').type('Suspicious payment proof');
      cy.get('[data-testid="confirm-reject"]').click();
    });
    
    cy.get('.toast-warning').should('contain', 'Purchase rejected');
    cy.assertUserVipLevelNotUpdated(2);
  });

  it('should update referral networks on approval', () => {
    cy.get('[data-testid="purchase-row-3"]').then(($row) => {
      const userId = $row.attr('data-user-id');
      cy.get('[data-testid="approve-btn"]').click();
      
      cy.waitForReferralUpdate(userId);
      cy.checkReferralBonuses(userId, 4); // 4 levels deep
    });
  });
});