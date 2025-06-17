import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit_log', (table) => {
    table.increments('log_id').primary();
    table.integer('admin_id').references('admin_id').inTable('admins');
    table.integer('user_id').references('user_id').inTable('users');
    table.string('action_type', 50).notNullable();
    table.text('description').notNullable();
    table.string('ip_address', 45);
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('audit_log');
}