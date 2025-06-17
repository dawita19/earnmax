import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('daily_tasks', (table) => {
    table.increments('task_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.integer('vip_level').notNullable();
    table.string('task_type', 50).notNullable();
    table.text('task_description').notNullable();
    table.decimal('earnings', 15, 2).notNullable();
    table.boolean('is_completed').defaultTo(false);
    table.timestamp('completion_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    
    // Indexes
    table.index(['user_id'], 'idx_daily_tasks_user_id');
    table.index(['is_completed'], 'idx_daily_tasks_is_completed');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('daily_tasks');
}