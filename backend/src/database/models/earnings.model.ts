import { 
  Model, DataTypes, Sequelize, 
  InferAttributes, InferCreationAttributes, CreationOptional 
} from 'sequelize';

type EarningType = 'task' | 'referral' | 'bonus' | 'purchase' | 'upgrade';

export class Earnings extends Model<
  InferAttributes<Earnings>,
  InferCreationAttributes<Earnings>
> {
  declare entry_id: CreationOptional<number>;
  declare user_id: number;
  declare earning_type: EarningType;
  declare amount: number;
  declare reference_id: number | null;
  declare description: string | null;
  declare ip_address: string | null;

  static initModel(sequelize: Sequelize): typeof Earnings {
    Earnings.init({
      entry_id: {
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
      earning_type: {
        type: DataTypes.ENUM('task', 'referral', 'bonus', 'purchase', 'upgrade'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'earnings_history',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['earning_type']
        },
        {
          fields: ['reference_id']
        }
      ]
    });

    return Earnings;
  }
}