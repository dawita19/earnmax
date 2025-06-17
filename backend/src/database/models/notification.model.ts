import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import { User } from './user.model';

interface NotificationAttributes {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  reference_id?: number | null;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, 'notification_id'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> 
  implements NotificationAttributes {
  public notification_id!: number;
  public user_id!: number;
  public title!: string;
  public message!: string;
  public is_read!: boolean;
  public notification_type!: string;
  public reference_id!: number | null;
  public readonly created_at!: Date;

  // Associations
  public readonly user?: User;
}

Notification.init({
  notification_id: {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notification_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['is_read']
    },
    {
      fields: ['created_at']
    }
  ]
});