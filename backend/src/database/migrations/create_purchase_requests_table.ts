import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('purchase_requests', (table) => {
    table.increments('request_id').primary();
    table.integer('user_id').references('user_id').inTable('users').notNullable();
    table.string('full_name', 100).notNullable();
    table.integer('inviter_id').references('user_id').inTable('users');
    table.integer('vip_level').notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('payment_proof_url').notNullable();
    table.string('payment_method', 50).notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.integer('admin_id').references('admin_id').inTable('admins');
    table.text('admin_notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('processed_at');
    
    // Indexes
    table.index(['user_id'], 'idx_purchase_requests_user_id');
    table.index(['status'], 'idx_purchase_requests_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('purchase_requests');
}