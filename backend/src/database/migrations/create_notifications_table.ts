import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('notification_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.string('title', 100).notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.string('notification_type', 50).notNullable();
    table.integer('reference_id'); // Related entity ID
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notifications');
}