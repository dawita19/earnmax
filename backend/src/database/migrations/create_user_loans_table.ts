import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_loans', (table) => {
    table.increments('loan_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.string('full_name', 100).notNullable();
    table.string('phone_number', 20).notNullable();
    table.decimal('total_withdrawn', 15, 2).defaultTo(0.00);
    table.decimal('total_profit', 15, 2).defaultTo(0.00);
    table.decimal('loan_amount', 15, 2).defaultTo(0.00);
    table.string('payment_method', 50);
    table.string('case_status', 50).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_loans');
}