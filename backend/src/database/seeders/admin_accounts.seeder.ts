import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const adminAccounts = [
  {
    username: 'superadmin',
    email: 'superadmin@earnmaxelite.com',
    password: 'SecurePassword123!',
    admin_level: 'high',
    permissions: {
      users: { read: true, write: true, delete: true },
      transactions: { read: true, write: true, approve: true },
      system: { configure: true, audit: true }
    }
  },
  {
    username: 'finance1',
    email: 'finance1@earnmaxelite.com',
    password: 'FinancePass456!',
    admin_level: 'low',
    permissions: {
      users: { read: true, write: false, delete: false },
      transactions: { read: true, write: true, approve: true },
      system: { configure: false, audit: false }
    }
  }
  // Add more admin accounts as needed
];

export async function seedAdminAccounts() {
  try {
    await prisma.admin.deleteMany();
    
    for (const admin of adminAccounts) {
      const hashedPassword = await bcrypt.hash(admin.password, SALT_ROUNDS);
      
      await prisma.admin.create({
        data: {
          username: admin.username,
          email: admin.email,
          password_hash: hashedPassword,
          admin_level: admin.admin_level,
          permissions: admin.permissions,
          is_active: true
        }
      });
    }
    
    console.log('Admin accounts seeded successfully');
  } catch (error) {
    console.error('Error seeding admin accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}