import { 
  Model, DataTypes, Sequelize, 
  InferAttributes, InferCreationAttributes, CreationOptional 
} from 'sequelize';

export class Task extends Model<
  InferAttributes<Task>,
  InferCreationAttributes<Task>
> {
  declare task_id: CreationOptional<number>;
  declare user_id: number;
  declare vip_level: number;
  declare task_type: string;
  declare task_description: string;
  declare earnings: number;
  declare is_completed: boolean;
  declare completion_date: Date | null;
  declare expires_at: Date;
  declare ip_address: string | null;

  static initModel(sequelize: Sequelize): typeof Task {
    Task.init({
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      vip_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 8
        }
      },
      task_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      task_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      earnings: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completion_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'daily_tasks',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['is_completed']
        },
        {
          fields: ['expires_at']
        }
      ]
    });

    return Task;
  }
}