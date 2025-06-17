import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('suspensions', (table) => {
    table.increments('suspension_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.integer('admin_id').references('admin_id').inTable('admins');
    table.text('reason').notNullable();
    table.enum('status', ['active', 'appealed', 'reversed', 'expired']).defaultTo('active');
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('suspensions');
}