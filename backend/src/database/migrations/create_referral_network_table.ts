import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('referral_network', (table) => {
    table.increments('relation_id').primary();
    table.integer('inviter_id').references('user_id').inTable('users').notNullable();
    table.integer('invitee_id').references('user_id').inTable('users').notNullable();
    table.integer('level').notNullable().checkBetween([1, 4]);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Composite unique constraint
    table.unique(['inviter_id', 'invitee_id']);
    
    // Indexes
    table.index(['inviter_id'], 'idx_referral_network_inviter_id');
    table.index(['invitee_id'], 'idx_referral_network_invitee_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('referral_network');
}