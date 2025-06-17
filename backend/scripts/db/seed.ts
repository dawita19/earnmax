#!/usr/bin/env ts-node
import { db } from '../../src/database/connection';
import { 
  vipLevels, 
  adminAccounts,
  systemDefaults
} from './seed-data';
import { logger } from '../../src/utils/logger';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Seed VIP Levels
    for (const level of vipLevels) {
      await db.transaction(async (tx) => {
        const exists = await tx.query.vipLevels.findFirst({
          where: (levels, { eq }) => eq(levels.levelId, level.levelId)
        });

        if (!exists) {
          await tx.insert(vipLevels).values(level);
          logger.info(`Added VIP Level ${level.levelId}`);
        }
      });
    }

    // Seed Admin Accounts
    for (const admin of adminAccounts) {
      await db.transaction(async (tx) => {
        const exists = await tx.query.admins.findFirst({
          where: (admins, { eq }) => eq(admins.username, admin.username)
        });

        if (!exists) {
          await tx.insert(admins).values(admin);
          logger.info(`Created admin account for ${admin.username}`);
        }
      });
    }

    // Initialize System Statistics
    await db.insert(systemStatistics).values(systemDefaults)
      .onConflictDoUpdate({
        target: systemStatistics.statId,
        set: systemDefaults
      });

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();