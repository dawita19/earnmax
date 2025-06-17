import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface AdminAttributes {
  admin_id: number;
  username: string;
  password_hash: string;
  email: string;
  admin_level: 'high' | 'low';
  permissions: object;
  last_login?: Date | null;
  login_attempts: number;
  is_active: boolean;
  two_factor_enabled: boolean;
}

class Admin extends Model<AdminAttributes> implements AdminAttributes {
  public admin_id!: number;
  public username!: string;
  public password_hash!: string;
  public email!: string;
  public admin_level!: 'high' | 'low';
  public permissions!: object;
  public last_login?: Date | null;
  public login_attempts!: number;
  public is_active!: boolean;
  public two_factor_enabled!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
  {
    admin_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    admin_level: {
      type: DataTypes.ENUM('high', 'low'),
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSONB,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
  }
);

export default Admin;