import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('upgrade_requests', (table) => {
    table.increments('request_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.string('full_name', 100).notNullable();
    table.integer('inviter_id').references('user_id').inTable('users');
    table.integer('current_vip_level').notNullable();
    table.decimal('current_amount', 15, 2).notNullable();
    table.integer('new_vip_level').notNullable();
    table.decimal('new_amount', 15, 2).notNullable();
    table.decimal('upgrade_difference', 15, 2).notNullable();
    table.decimal('recharge_amount', 15, 2).notNullable();
    table.string('payment_proof_url');
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.integer('admin_id').references('admin_id').inTable('admins');
    table.text('admin_notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('processed_at');
    
    // Indexes
    table.index(['user_id'], 'idx_upgrade_requests_user_id');
    table.index(['status'], 'idx_upgrade_requests_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('upgrade_requests');
}