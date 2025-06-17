import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('task_history', (table) => {
    table.increments('history_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.integer('task_id').references('task_id').inTable('daily_tasks').notNullable();
    table.integer('vip_level').notNullable();
    table.string('task_type', 50).notNullable();
    table.decimal('earnings', 15, 2).notNullable();
    table.timestamp('completed_at').notNullable();
    table.string('ip_address', 45);
    
    // Indexes
    table.index(['user_id'], 'idx_task_history_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('task_history');
}