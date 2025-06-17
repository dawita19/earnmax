import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { User, Admin } from '../models';
import { compareSync } from 'bcryptjs';
import { Request } from 'express';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: true
};

export const userJwtStrategy = new JwtStrategy(jwtOptions, async (req: Request, payload: any, done) => {
  try {
    const user = await User.findByPk(payload.sub, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user || user.accountStatus !== 'active') {
      return done(null, false);
    }

    req.user = user;
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});

export const adminJwtStrategy = new JwtStrategy(jwtOptions, async (req: Request, payload: any, done) => {
  try {
    const admin = await Admin.findByPk(payload.sub, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!admin || !admin.isActive) {
      return done(null, false);
    }

    req.admin = admin;
    return done(null, admin);
  } catch (error) {
    return done(error, false);
  }
});

export const localUserStrategy = new LocalStrategy(
  { usernameField: 'login', passwordField: 'password' },
  async (login, password, done) => {
    try {
      const user = await User.findOne({
        where: { 
          [Op.or]: [{ email: login }, { phoneNumber: login }] 
        }
      });

      if (!user || !compareSync(password, user.passwordHash)) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      if (user.isLocked) {
        return done(null, false, { message: 'Account locked' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);