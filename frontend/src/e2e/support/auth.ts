import './commands';

// Auth test helpers
export const generateTestUser = (inviterId?: number) => {
  const timestamp = new Date().getTime();
  const phone = `+2519${timestamp.toString().slice(-8)}`;
  const inviteCode = `INV${timestamp.toString().slice(-6)}`;
  
  return {
    full_name: `Test User ${timestamp}`,
    phone_number: phone,
    email: `test${timestamp}@earnmax.com`,
    password_hash: '$2a$10$fakehashfortesting',
    invite_code: inviteCode,
    inviter_id: inviterId || null,
    vip_level: 0,
    vip_amount: 0.00
  };
};

export const createTestUser = (userData?: any) => {
  const user = userData || generateTestUser();
  
  before(() => {
    cy.task('insertUser', user).then((userId) => {
      Cypress.env('testUserId', userId);
    });
  });

  after(() => {
    if (Cypress.env('testUserId')) {
      cy.task('deleteUser', Cypress.env('testUserId'));
    }
  });
};

export const createAdminUser = (level: 'high' | 'low') => {
  const admin = {
    username: `${level}_admin_${new Date().getTime()}`,
    password_hash: '$2a$10$fakeadminhash',
    email: `${level}.admin@earnmax.com`,
    admin_level: level,
    permissions: level === 'high' 
      ? { all: true } 
      : { 
          purchase_approval: true,
          upgrade_approval: true,
          withdrawal_approval: true 
        }
  };

  before(() => {
    cy.task('insertAdmin', admin).then((adminId) => {
      Cypress.env(`${level}AdminId`, adminId);
    });
  });

  after(() => {
    if (Cypress.env(`${level}AdminId`)) {
      cy.task('deleteAdmin', Cypress.env(`${level}AdminId`));
    }
  });
};