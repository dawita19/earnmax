import { 
  Model, DataTypes, Sequelize, 
  InferAttributes, InferCreationAttributes, CreationOptional 
} from 'sequelize';

export class Bonus extends Model<
  InferAttributes<Bonus>,
  InferCreationAttributes<Bonus>
> {
  declare bonus_id: CreationOptional<number>;
  declare inviter_id: number;
  declare invitee_id: number;
  declare level: number;
  declare amount: number;
  declare source: 'purchase' | 'upgrade' | 'task';
  declare source_id: number;

  static initModel(sequelize: Sequelize): typeof Bonus {
    Bonus.init({
      bonus_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      inviter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      invitee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 4
        }
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      source: {
        type: DataTypes.ENUM('purchase', 'upgrade', 'task'),
        allowNull: false
      },
      source_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'referral_bonuses',
      timestamps: true,
      indexes: [
        {
          fields: ['inviter_id']
        },
        {
          fields: ['invitee_id']
        },
        {
          fields: ['source', 'source_id']
        }
      ]
    });

    return Bonus;
  }
}