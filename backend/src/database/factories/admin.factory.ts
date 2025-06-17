import { PrismaClient, Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

type AdminFactoryOptions = {
  adminLevel?: 'high' | 'low';
  permissions?: any;
  isActive?: boolean;
};

export async function createAdmin(options: AdminFactoryOptions = {}): Promise<Admin> {
  const {
    adminLevel = 'low',
    permissions = {
      users: { read: true, write: false, delete: false },
      transactions: { read: true, write: true, approve: true },
      system: { configure: false, audit: false }
    },
    isActive = true
  } = options;

  const username = `admin_${Date.now()}`;
  const email = `${username}@earnmaxelite.com`;
  const password = `AdminPass${Math.floor(Math.random() * 1000)}!`;

  return prisma.admin.create({
    data: {
      username,
      email,
      password_hash: await bcrypt.hash(password, SALT_ROUNDS),
      admin_level: adminLevel,
      permissions,
      is_active: isActive
    }
  });
}

export async function createHighLevelAdmin(): Promise<Admin> {
  return createAdmin({
    adminLevel: 'high',
    permissions: {
      users: { read: true, write: true, delete: true },
      transactions: { read: true, write: true, approve: true },
      system: { configure: true, audit: true }
    }
  });
}