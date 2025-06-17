import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

type UserFactoryOptions = {
  vipLevel?: number;
  inviterId?: number | null;
  accountStatus?: 'active' | 'suspended' | 'locked';
  withBalance?: boolean;
};

export async function createUser(options: UserFactoryOptions = {}): Promise<User> {
  const {
    vipLevel = 0,
    inviterId = null,
    accountStatus = 'active',
    withBalance = false
  } = options;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const phone = faker.phone.number('+2519########');
  const password = faker.internet.password();

  const userData = {
    full_name: `${firstName} ${lastName}`,
    phone_number: phone,
    email: email,
    password_hash: password, // Note: In real usage, hash this password
    ip_address: faker.internet.ipv4(),
    inviter_id: inviterId,
    invite_code: faker.string.alphanumeric(8).toUpperCase(),
    vip_level: vipLevel,
    vip_amount: vipLevel * 1200, // Example calculation
    balance: withBalance ? faker.number.float({ min: 100, max: 5000 }) : 0,
    account_status: accountStatus,
    payment_method: faker.helpers.arrayElement(['telebirr', 'cbe', 'bank']),
    payment_details: JSON.stringify({
      account_name: `${firstName} ${lastName}`,
      account_number: faker.finance.accountNumber()
    })
  };

  return prisma.user.create({
    data: userData
  });
}

export async function createUserWithReferralNetwork(
  levels: number = 4,
  vipLevel: number = 1
): Promise<{ rootUser: User; network: User[] }> {
  const rootUser = await createUser({ vipLevel });
  const network: User[] = [];
  
  let currentInviterId = rootUser.user_id;
  
  for (let i = 1; i <= levels; i++) {
    const newUser = await createUser({ 
      vipLevel: Math.max(0, vipLevel - 1),
      inviterId: currentInviterId
    });
    network.push(newUser);
    currentInviterId = newUser.user_id;
  }
  
  return { rootUser, network };
}