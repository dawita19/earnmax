import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

interface ReferralNetworkAttributes {
  relation_id: number;
  inviter_id: number;
  invitee_id: number;
  level: number;
  created_at: Date;
}

class ReferralNetwork extends Model<ReferralNetworkAttributes> implements ReferralNetworkAttributes {
  public relation_id!: number;
  public inviter_id!: number;
  public invitee_id!: number;
  public level!: number;
  public created_at!: Date;
}

ReferralNetwork.init({
  relation_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  inviter_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  },
  invitee_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ReferralNetwork',
  tableName: 'referral_network',
  indexes: [
    { fields: ['inviter_id'] },
    { fields: ['invitee_id'] },
    { fields: ['inviter_id', 'invitee_id'], unique: true }
  ]
});

export default ReferralNetwork;