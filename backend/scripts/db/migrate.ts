#!/usr/bin/env ts-node
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../../src/database/connection';
import { logger } from '../../src/utils/logger';
import path from 'path';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../../../drizzle/migrations'),
      migrationsTable: 'earnmax_migrations'
    });

    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();