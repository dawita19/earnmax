import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PurchaseRequest } from './purchase.model';
import { UpgradeRequest } from './upgrade.model';

@Table({
  tableName: 'vip_levels',
  timestamps: true,
  paranoid: true,
})
export class VipLevel extends Model<VipLevel> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    unique: true,
    allowNull: false,
  })
  level: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Investment amount in Birr',
  })
  investment_amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Daily earning in Birr',
  })
  daily_earning: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Earnings per task in Birr',
  })
  per_task_earning: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  min_withdrawal: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  max_total_withdrawal: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  investment_area: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Array of 4 daily tasks with descriptions',
  })
  daily_tasks: {
    task1: string;
    task2: string;
    task3: string;
    task4: string;
  };

  @HasMany(() => PurchaseRequest)
  purchase_requests: PurchaseRequest[];

  @HasMany(() => UpgradeRequest)
  upgrade_requests: UpgradeRequest[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;

  @Column({
    type: DataType.DATE,
  })
  deletedAt: Date;
}