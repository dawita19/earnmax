import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('earnings_history', (table) => {
    table.increments('entry_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.enum('earning_type', ['task', 'referral', 'bonus', 'purchase', 'upgrade']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.integer('reference_id'); // Could be task_id, request_id, etc.
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('ip_address', 45);
    
    // Indexes
    table.index(['user_id'], 'idx_earnings_history_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('earnings_history');
}