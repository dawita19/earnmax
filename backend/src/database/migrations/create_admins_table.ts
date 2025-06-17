import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('admins', (table) => {
    table.increments('admin_id').primary();
    table.string('username', 50).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('email', 100).unique().notNullable();
    table.enum('admin_level', ['high', 'low']).notNullable();
    table.jsonb('permissions');
    table.timestamp('last_login');
    table.integer('login_attempts').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('two_factor_enabled').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('admins');
}