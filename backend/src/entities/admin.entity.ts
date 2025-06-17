import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  admin_id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password_hash: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['high', 'low'] })
  admin_level: 'high' | 'low';

  @Column({ type: 'jsonb', nullable: true })
  permissions: any;

  @Column({ default: 0 })
  login_attempts: number;

  @Column({ default: false })
  is_locked: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}