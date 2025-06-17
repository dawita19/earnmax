import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('referral_bonuses', (table) => {
    table.increments('bonus_id').primary();
    table.integer('inviter_id').references('user_id').inTable('users').notNullable();
    table.integer('invitee_id').references('user_id').inTable('users').notNullable();
    table.integer('level').notNullable().checkBetween([1, 4]);
    table.decimal('amount', 15, 2).notNullable();
    table.enum('source', ['purchase', 'upgrade', 'task']).notNullable();
    table.integer('source_id').notNullable(); // Reference to purchase/upgrade/task
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['inviter_id'], 'idx_referral_bonuses_inviter_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('referral_bonuses');
}