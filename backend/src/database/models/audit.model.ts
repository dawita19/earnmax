import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import { Admin } from './admin.model';
import { User } from './user.model';

interface AuditLogAttributes {
  log_id: number;
  admin_id?: number | null;
  user_id?: number | null;
  action_type: string;
  description: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

type AuditLogCreationAttributes = Optional<AuditLogAttributes, 'log_id'>;

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> 
  implements AuditLogAttributes {
  public log_id!: number;
  public admin_id!: number | null;
  public user_id!: number | null;
  public action_type!: string;
  public description!: string;
  public ip_address!: string | null;
  public user_agent!: string | null;
  public readonly created_at!: Date;

  // Associations
  public readonly admin?: Admin;
  public readonly user?: User;
}

AuditLog.init({
  log_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'admin_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['admin_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['action_type']
    },
    {
      fields: ['created_at']
    }
  ]
});