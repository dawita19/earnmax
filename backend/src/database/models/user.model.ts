import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface UserAttributes {
  user_id: number;
  full_name: string;
  phone_number: string;
  email: string | null;
  password_hash: string;
  ip_address?: string;
  inviter_id?: number | null;
  invite_code: string;
  vip_level: number;
  vip_amount: number;
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
  total_referral_bonus: number;
  first_level_invites: number;
  second_level_invites: number;
  third_level_invites: number;
  fourth_level_invites: number;
  total_invites: number;
  payment_method?: string | null;
  payment_details?: string | null;
  account_status: 'active' | 'suspended' | 'locked';
  join_date: Date;
  last_login?: Date | null;
  login_attempts: number;
  is_locked: boolean;
  two_factor_enabled: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: number;
  public full_name!: string;
  public phone_number!: string;
  public email!: string | null;
  public password_hash!: string;
  public ip_address?: string;
  public inviter_id?: number | null;
  public invite_code!: string;
  public vip_level!: number;
  public vip_amount!: number;
  public balance!: number;
  public total_earnings!: number;
  public total_withdrawn!: number;
  public total_referral_bonus!: number;
  public first_level_invites!: number;
  public second_level_invites!: number;
  public third_level_invites!: number;
  public fourth_level_invites!: number;
  public total_invites!: number;
  public payment_method?: string | null;
  public payment_details?: string | null;
  public account_status!: 'active' | 'suspended' | 'locked';
  public join_date!: Date;
  public last_login?: Date | null;
  public login_attempts!: number;
  public is_locked!: boolean;
  public two_factor_enabled!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getInviter!: () => Promise<User>;
  public getInvitees!: () => Promise<User[]>;
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      validate: {
        is: /^\+?[0-9]{10,15}$/,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    inviter_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    invite_code: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
    },
    vip_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    vip_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    total_earnings: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    total_withdrawn: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    total_referral_bonus: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    first_level_invites: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    second_level_invites: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    third_level_invites: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fourth_level_invites: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_invites: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    payment_details: {
      type: DataTypes.TEXT,
    },
    account_status: {
      type: DataTypes.ENUM('active', 'suspended', 'locked'),
      defaultValue: 'active',
    },
    join_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    indexes: [
      {
        fields: ['inviter_id'],
        name: 'idx_users_inviter_id',
      },
      {
        fields: ['vip_level'],
        name: 'idx_users_vip_level',
      },
      {
        fields: ['account_status'],
        name: 'idx_users_account_status',
      },
    ],
  }
);

// Self-referential association for referral system
User.hasMany(User, { foreignKey: 'inviter_id', as: 'Invitees' });
User.belongsTo(User, { foreignKey: 'inviter_id', as: 'Inviter' });

export default User;