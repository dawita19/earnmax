import './commands';

// VIP test helpers
export const VIP_LEVELS = [
  { level: 0, investment: 0, daily: 20, perTask: 5.00, minWithdraw: 60, maxWithdraw: 300 },
  { level: 1, investment: 1200, daily: 40, perTask: 10.00, minWithdraw: 40, maxWithdraw: 4800 },
  { level: 2, investment: 3000, daily: 100, perTask: 25.00, minWithdraw: 100, maxWithdraw: 12000 },
  { level: 3, investment: 6000, daily: 200, perTask: 50.00, minWithdraw: 200, maxWithdraw: 24000 },
  { level: 4, investment: 12000, daily: 400, perTask: 100.00, minWithdraw: 400, maxWithdraw: 48000 },
  { level: 5, investment: 21000, daily: 700, perTask: 175.00, minWithdraw: 700, maxWithdraw: 84000 },
  { level: 6, investment: 33000, daily: 1100, perTask: 275.00, minWithdraw: 1100, maxWithdraw: 132000 },
  { level: 7, investment: 60000, daily: 2000, perTask: 500.00, minWithdraw: 2000, maxWithdraw: 240000 },
  { level: 8, investment: 120000, daily: 4000, perTask: 1000.00, minWithdraw: 4000, maxWithdraw: 480000 }
];

export const createVIPPurchaseRequest = (userId: number, vipLevel: number) => {
  const vipData = VIP_LEVELS.find(v => v.level === vipLevel);
  if (!vipData) throw new Error(`Invalid VIP level: ${vipLevel}`);

  const request = {
    user_id: userId,
    vip_level: vipLevel,
    amount: vipData.investment,
    payment_method: 'bank_transfer',
    payment_proof_url: 'https://example.com/fake_proof.jpg',
    status: 'pending'
  };

  before(() => {
    cy.task('insertPurchaseRequest', request).then((requestId) => {
      Cypress.env('purchaseRequestId', requestId);
    });
  });

  after(() => {
    if (Cypress.env('purchaseRequestId')) {
      cy.task('deletePurchaseRequest', Cypress.env('purchaseRequestId'));
    }
  });
};

export const verifyVIPUpgrade = (userId: number, fromLevel: number, toLevel: number) => {
  const fromVip = VIP_LEVELS.find(v => v.level === fromLevel);
  const toVip = VIP_LEVELS.find(v => v.level === toLevel);
  
  if (!fromVip || !toVip) {
    throw new Error('Invalid VIP levels provided');
  }

  // Verify user record updated
  cy.task('queryDb', `SELECT * FROM users WHERE user_id = ${userId}`).then((user: any) => {
    expect(user.vip_level).to.equal(toLevel);
    expect(parseFloat(user.vip_amount)).to.equal(toVip.investment);
    
    // Verify daily earnings calculation
    const expectedDaily = toVip.investment / 30;
    expect(parseFloat(user.daily_earnings)).to.be.closeTo(expectedDaily, 0.01);
  });

  // Verify loan record
  cy.task('queryDb', 
    `SELECT * FROM user_loans WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1`
  ).then((loan: any) => {
    expect(parseFloat(loan.original_amount)).to.equal(toVip.investment);
    expect(loan.status).to.equal('active');
  });
};

export const generateTasksForVIP = (vipLevel: number) => {
  const tasks = {
    0: ['view_ad', 'spin_reward', 'share_post', 'watch_video'],
    1: ['click_ad', 'comment_promo', 'share_promotion', 'claim_reward'],
    2: ['view_product', 'simulate_order', 'track_delivery', 'rate_item'],
    3: ['analyze_prices', 'wishlist_item', 'read_tip', 'give_feedback'],
    4: ['review_brand', 'share_campaign', 'answer_poll', 'referral_action'],
    5: ['register_order', 'watch_launch', 'simulate_traffic', 'rate_ad'],
    6: ['simulate_invest', 'track_return', 'report_result', 'take_quiz'],
    7: ['budget_simulation', 'review_startup', 'vote_project', 'submit_strategy'],
    8: ['sim_portfolio', 'read_earnings', 'analyze_trends', 'predict_outlook']
  };

  return tasks[vipLevel] || [];
};