import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Admin } from './admin.model';

@Table({
  tableName: 'withdrawal_requests',
  timestamps: true,
})
export class WithdrawalRequest extends Model<WithdrawalRequest> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  payment_method: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Payment details like account number, etc.',
  })
  payment_details: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  })
  status: string;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    comment: 'Admin who processed the request',
  })
  admin_id: number;

  @BelongsTo(() => Admin)
  admin: Admin;

  @Column({
    type: DataType.TEXT,
    comment: 'Admin notes about the request',
  })
  admin_notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    comment: 'When the request was processed',
  })
  processed_at: Date;

  @Column({
    type: DataType.STRING(45),
    comment: 'IP address of the user when making request',
  })
  ip_address: string;
}