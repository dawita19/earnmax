import { prisma } from '../../config/db';

export const PaymentAccountModel = {
  async create(data: { name: string; type: string; accountNumber: string; active: boolean }) {
    return prisma.paymentAccount.create({ data });
  },
  async update(id: number, data: Partial<{ name: string; type: string; accountNumber: string; active: boolean }>) {
    return prisma.paymentAccount.update({ where: { id }, data });
  },
  async getAll() {
    return prisma.paymentAccount.findMany();
  },
  async getById(id: number) {
    return prisma.paymentAccount.findUnique({ where: { id } });
  },
  async delete(id: number) {
    return prisma.paymentAccount.delete({ where: { id } });
  }
};