import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export async function seedTestUsers(count: number = 50) {
  try {
    await prisma.user.deleteMany();
    
    // Create root inviter
    const rootInviter = await createUser(0, null);
    
    // Create first level invites
    const firstLevelUsers = await Promise.all(
      Array(5).fill(0).map(() => createUser(0, rootInviter.user_id))
    );
    
    // Create second level invites
    await Promise.all(
      firstLevelUsers.map(async (user) => {
        return Promise.all(
          Array(3).fill(0).map(() => createUser(0, user.user_id))
        );
      })
    );
    
    // Create remaining random users
    const remainingCount = count - 1 - 5 - (5 * 3);
    if (remainingCount > 0) {
      const allUsers = await prisma.user.findMany();
      await Promise.all(
        Array(remainingCount).fill(0).map(() => {
          const randomInviter = faker.helpers.arrayElement(allUsers);
          return createUser(faker.number.int({ min: 0, max: 8 }), randomInviter.user_id);
        })
      );
    }
    
    console.log(`Successfully seeded ${count} test users`);
  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createUser(vipLevel: number, inviterId: number | null) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const phone = faker.phone.number('+2519########');
  const password = faker.internet.password();
  
  return prisma.user.create({
    data: {
      full_name: `${firstName} ${lastName}`,
      phone_number: phone,
      email: email,
      password_hash: await bcrypt.hash(password, SALT_ROUNDS),
      ip_address: faker.internet.ipv4(),
      inviter_id: inviterId,
      invite_code: faker.string.alphanumeric(8).toUpperCase(),
      vip_level: vipLevel,
      vip_amount: vipLevel * 1200, // Example calculation
      balance: faker.number.float({ min: 0, max: 5000 }),
      account_status: 'active',
      payment_method: faker.helpers.arrayElement(['telebirr', 'cbe', 'bank']),
      payment_details: JSON.stringify({
        account_name: `${firstName} ${lastName}`,
        account_number: faker.finance.accountNumber()
      })
    }
  });
}