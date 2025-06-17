import { 
  Model, DataTypes, Sequelize, 
  InferAttributes, InferCreationAttributes, CreationOptional 
} from 'sequelize';

export class Loan extends Model<
  InferAttributes<Loan>,
  InferCreationAttributes<Loan>
> {
  declare loan_id: CreationOptional<number>;
  declare user_id: number;
  declare original_amount: number;
  declare current_balance: number;
  declare total_profit: number;
  declare status: 'active' | 'paid' | 'defaulted';
  declare vip_level: number;

  static initModel(sequelize: Sequelize): typeof Loan {
    Loan.init({
      loan_id: {
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
      original_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      current_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      total_profit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: DataTypes.ENUM('active', 'paid', 'defaulted'),
        allowNull: false,
        defaultValue: 'active'
      },
      vip_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 8
        }
      }
    }, {
      sequelize,
      tableName: 'user_loans',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['vip_level']
        }
      ],
      hooks: {
        beforeUpdate: (loan: Loan) => {
          if (loan.changed('current_balance') && loan.current_balance <= 0) {
            loan.status = 'paid';
          }
        }
      }
    });

    return Loan;
  }
}