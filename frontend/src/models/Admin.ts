import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PERMISSIONS } from '@/constants';

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  admin_level: {
    type: String,
    enum: ['high', 'low'],
    required: true
  },
  permissions: {
    type: Map,
    of: Boolean,
    default: () => {
      const perms: Record<string, boolean> = {};
      Object.values(PERMISSIONS).forEach(p => (perms[p] = false));
      return perms;
    }
  },
  last_login: Date,
  login_attempts: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  methods: {
    async comparePassword(candidatePassword: string) {
      if (this.login_attempts >= 5) {
        throw new Error('Account locked - too many attempts');
      }
      
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      
      if (!isMatch) {
        this.login_attempts += 1;
        await this.save();
        return false;
      }
      
      // Reset attempts on successful login
      this.login_attempts = 0;
      this.last_login = new Date();
      await this.save();
      
      return true;
    }
  }
});

// Password hashing middleware
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);