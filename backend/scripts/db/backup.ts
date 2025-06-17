#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { logger } from '../../src/utils/logger';
import { config } from '../../src/config';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';

async function backupDatabase() {
  const timestamp = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
  const backupDir = path.join(__dirname, '../../../backups');
  const backupFile = path.join(backupDir, `earnmax_backup_${timestamp}.sql`);

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    logger.info(`Starting database backup to ${backupFile}`);

    const command = `pg_dump -U ${config.db.user} -h ${config.db.host} -p ${config.db.port} -F c -f ${backupFile} ${config.db.name}`;

    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Backup failed: ${stderr}`);
          reject(error);
        } else {
          logger.info(`Backup completed successfully: ${stdout}`);
          resolve(stdout);
        }
      });
    });

    // Rotate backups (keep last 7)
    const files = fs.readdirSync(backupDir)
      .filter(file => file.match(/earnmax_backup_.*\.sql/))
      .sort()
      .reverse();
    
    if (files.length > 7) {
      for (const file of files.slice(7)) {
        fs.unlinkSync(path.join(backupDir, file));
        logger.info(`Rotated old backup: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Backup process failed:', error);
    process.exit(1);
  }
}

backupDatabase();