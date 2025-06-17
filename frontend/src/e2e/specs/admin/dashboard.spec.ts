describe('High-Level Admin Dashboard', () => {
  before(() => {
    cy.loginHighLevelAdmin();
    cy.visit('/admin/dashboard');
  });

  it('should display real-time metrics', () => {
    // Test websocket-connected metrics
    cy.get('[data-testid="total-revenue"]').should('contain', 'Birr');
    cy.get('[data-testid="total-users"]').should('be.visible');
    cy.get('[data-testid="withdrawal-requests"]').should('be.visible');
    
    // Verify metrics update
    cy.wait(5000); // Allow for real-time updates
    cy.get('[data-testid="metrics-updated-at"]').then(($el) => {
      const initialTimestamp = $el.text();
      cy.wait(3000);
      cy.get('[data-testid="metrics-updated-at"]').should('not.contain', initialTimestamp);
    });
  });

  it('should display VIP distribution chart', () => {
    cy.get('[data-testid="vip-distribution-chart"]').should('exist');
    cy.get('.vip-level-0').should('contain', 'VIP 0');
    cy.get('.vip-level-8').should('contain', 'VIP 8');
  });

  it('should navigate to user management', () => {
    cy.get('[data-testid="nav-users"]').click();
    cy.url().should('include', '/admin/users');
    cy.get('[data-testid="user-search"]').should('exist');
  });

  it('should display admin activity log', () => {
    cy.get('[data-testid="nav-audit-log"]').click();
    cy.get('.audit-log-entry').should('have.length.gt', 0);
    cy.get('.audit-log-entry').first().should('contain', 'Login');
  });
});