import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('system_statistics', (table) => {
    table.increments('stat_id').primary();
    table.integer('total_users').defaultTo(0);
    table.integer('active_users').defaultTo(0);
    table.decimal('total_revenue', 15, 2).defaultTo(0.00);
    table.decimal('total_withdrawals', 15, 2).defaultTo(0.00);
    table.decimal('total_purchases', 15, 2).defaultTo(0.00);
    table.decimal('total_upgrades', 15, 2).defaultTo(0.00);
    table.integer('pending_withdrawals').defaultTo(0);
    table.integer('pending_purchases').defaultTo(0);
    table.integer('pending_upgrades').defaultTo(0);
    table.integer('suspended_users').defaultTo(0);
    table.jsonb('vip_distribution'); // Count of users per VIP level
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('system_statistics');
}