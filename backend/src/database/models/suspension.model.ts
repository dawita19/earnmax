import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import { Admin } from './admin.model';
import { User } from './user.model';

interface SuspensionAttributes {
  suspension_id: number;
  user_id: number;
  admin_id?: number | null;
  reason: string;
  status: 'active' | 'appealed' | 'reversed' | 'expired';
  start_date: Date;
  end_date?: Date | null;
  notes?: string | null;
}

type SuspensionCreationAttributes = Optional<SuspensionAttributes, 'suspension_id'>;

export class Suspension extends Model<SuspensionAttributes, SuspensionCreationAttributes> 
  implements SuspensionAttributes {
  public suspension_id!: number;
  public user_id!: number;
  public admin_id!: number | null;
  public reason!: string;
  public status!: 'active' | 'appealed' | 'reversed' | 'expired';
  public start_date!: Date;
  public end_date!: Date | null;
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public readonly user?: User;
  public readonly admin?: Admin;
}

Suspension.init({
  suspension_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admins',
      key: 'admin_id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'appealed', 'reversed', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'suspensions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

// Associations are defined in ../connection.ts or ../models/index.ts