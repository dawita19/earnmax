import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('vip_levels', (table) => {
    table.integer('level_id').primary();
    table.decimal('investment_amount', 15, 2).notNullable();
    table.decimal('daily_earning', 15, 2).notNullable();
    table.decimal('per_task_earning', 15, 2).notNullable();
    table.decimal('min_withdrawal', 15, 2).notNullable();
    table.decimal('max_total_withdrawal', 15, 2).notNullable();
    table.string('investment_area', 100).notNullable();
    table.jsonb('daily_tasks').notNullable(); // Stores the 4 tasks as JSON array
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('vip_levels');
}