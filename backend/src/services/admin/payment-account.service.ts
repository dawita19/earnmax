import { PaymentAccountModel } from '../../database/models/PaymentAccount';

export class PaymentAccountService {
  static async createAccount(data: { name: string; type: string; accountNumber: string }) {
    return PaymentAccountModel.create({ ...data, active: true });
  }

  static async updateAccount(id: number, data: { name?: string; type?: string; accountNumber?: string; active?: boolean }) {
    return PaymentAccountModel.update(id, data);
  }

  static async listAccounts() {
    return PaymentAccountModel.getAll();
  }

  static async deleteAccount(id: number) {
    return PaymentAccountModel.delete(id);
  }
}