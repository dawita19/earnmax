import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary();
    table.string('full_name', 100).notNullable();
    table.string('phone_number', 20).unique().notNullable();
    table.string('email', 100).unique();
    table.string('password_hash', 255).notNullable();
    table.string('ip_address', 45);
    table.integer('inviter_id').references('user_id').inTable('users');
    table.string('invite_code', 10).unique().notNullable();
    table.integer('vip_level').defaultTo(0);
    table.decimal('vip_amount', 15, 2).defaultTo(0.00);
    table.decimal('balance', 15, 2).defaultTo(0.00);
    table.decimal('total_earnings', 15, 2).defaultTo(0.00);
    table.decimal('total_withdrawn', 15, 2).defaultTo(0.00);
    table.decimal('total_referral_bonus', 15, 2).defaultTo(0.00);
    table.integer('first_level_invites').defaultTo(0);
    table.integer('second_level_invites').defaultTo(0);
    table.integer('third_level_invites').defaultTo(0);
    table.integer('fourth_level_invites').defaultTo(0);
    table.integer('total_invites').defaultTo(0);
    table.string('payment_method', 50);
    table.text('payment_details');
    table.string('account_status', 20).defaultTo('active');
    table.timestamp('join_date').defaultTo(knex.fn.now());
    table.timestamp('last_login');
    table.integer('login_attempts').defaultTo(0);
    table.boolean('is_locked').defaultTo(false);
    table.boolean('two_factor_enabled').defaultTo(false);
    
    // Indexes
    table.index(['inviter_id'], 'idx_users_inviter_id');
    table.index(['vip_level'], 'idx_users_vip_level');
    table.index(['account_status'], 'idx_users_account_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}