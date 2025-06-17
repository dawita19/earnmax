#!/usr/bin/env ts-node
import { db } from '../../src/database/connection';
import { logger } from '../../src/utils/logger';
import inquirer from 'inquirer';
import { isValidIP } from '../../src/utils/validation';

interface IPInput {
  ipAddress: string;
  description: string;
  adminOnly: boolean;
}

async function whitelistIP() {
  try {
    logger.info('Starting IP whitelisting process...');

    const answers: IPInput = await inquirer.prompt([
      {
        type: 'input',
        name: 'ipAddress',
        message: 'Enter IP address to whitelist:',
        validate: input => isValidIP(input) || 'Invalid IP address format'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter description for this IP (e.g., "Main Office"):'
      },
      {
        type: 'confirm',
        name: 'adminOnly',
        message: 'Restrict to admin access only?',
        default: true
      }
    ]);

    await db.insert(ipWhitelist).values({
      ipAddress: answers.ipAddress,
      description: answers.description,
      adminOnly: answers.adminOnly,
      createdAt: new Date(),
      createdBy: 'system-script'
    });

    logger.info(`Successfully whitelisted IP ${answers.ipAddress}`);
    logger.warn('Remember to restart the server for changes to take effect!');
  } catch (error) {
    if (error.code === '23505') {
      logger.error('This IP address is already whitelisted');
    } else {
      logger.error('IP whitelisting failed:', error);
    }
    process.exit(1);
  }
}

whitelistIP();