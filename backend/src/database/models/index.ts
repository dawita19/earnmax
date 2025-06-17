import { Sequelize } from 'sequelize';
import config from '../../config/database';

const sequelize = new Sequelize(config);

// Import all models
import User from './user.model';
import Admin from './admin.model';
import VIPLevel from './vipLevel.model';
import PurchaseRequest from './purchaseRequest.model';
import UpgradeRequest from './upgradeRequest.model';
import WithdrawalRequest from './withdrawalRequest.model';
import Task from './task.model';
import ReferralNetwork from './referralNetwork.model';
import ReferralBonus from './referralBonus.model';
import UserLoan from './userLoan.model';
import Suspension from './suspension.model';
import AuditLog from './auditLog.model';

// Initialize models
const models = {
  User: User.initialize(sequelize),
  Admin: Admin.initialize(sequelize),
  VIPLevel: VIPLevel.initialize(sequelize),
  PurchaseRequest: PurchaseRequest.initialize(sequelize),
  UpgradeRequest: UpgradeRequest.initialize(sequelize),
  WithdrawalRequest: WithdrawalRequest.initialize(sequelize),
  Task: Task.initialize(sequelize),
  ReferralNetwork: ReferralNetwork.initialize(sequelize),
  ReferralBonus: ReferralBonus.initialize(sequelize),
  UserLoan: UserLoan.initialize(sequelize),
  Suspension: Suspension.initialize(sequelize),
  AuditLog: AuditLog.initialize(sequelize),
};

// Set up associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;