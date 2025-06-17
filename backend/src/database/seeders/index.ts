import { seedVipLevels } from './initial_vip_levels.seeder';
import { seedAdminAccounts } from './admin_accounts.seeder';
import { seedSystemStatistics } from './system_statistics.seeder';
import { seedTestUsers } from './test_users.seeder';

async function runSeeders() {
  console.log('Starting database seeding...');
  
  try {
    await seedVipLevels();
    await seedAdminAccounts();
    await seedSystemStatistics();
    await seedTestUsers(100);
    
    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runSeeders();