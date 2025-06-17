import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { VipLevel } from './vip-level.model';
import { Admin } from './admin.model';

@Table({
  tableName: 'upgrade_requests',
  timestamps: true,
})
export class UpgradeRequest extends Model<UpgradeRequest> {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID of the user who invited this user',
  })
  inviter_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Current VIP level before upgrade',
  })
  current_vip_level: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount paid for current VIP level',
  })
  current_amount: number;

  @ForeignKey(() => VipLevel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'New VIP level after upgrade',
  })
  new_vip_level: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount required for new VIP level',
  })
  new_amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Additional amount user needs to pay for upgrade',
  })
  recharge_amount: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'URL to the payment proof image',
  })
  payment_proof_url: string;

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
}