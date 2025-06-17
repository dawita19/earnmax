import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.model';
import { Suspension } from '../../models/suspension.model';

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Check for token in headers or cookies
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.userToken;
        
        if (!token) {
            throw new Error('Authentication required');
        }

        // 2. Verify JWT token
        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET!) as { 
            userId: string;
            sessionId: string;
            vipLevel: number;
        };

        // 3. Find user with active session
        const user = await User.findOne({
            _id: decoded.userId,
            'sessions.sessionId': decoded.sessionId,
            account_status: 'active'
        });

        if (!user) {
            throw new Error('User not found or session expired');
        }

        // 4. Check for active suspensions
        const activeSuspension = await Suspension.findOne({
            user_id: user._id,
            status: 'active',
            end_date: { $gt: new Date() }
        });

        if (activeSuspension) {
            throw new Error(`Account suspended until ${activeSuspension.end_date}. Reason: ${activeSuspension.reason}`);
        }

        // 5. Verify VIP level consistency
        if (user.vip_level !== decoded.vipLevel) {
            // Force token refresh if VIP level changed
            throw new Error('Session expired - VIP level changed');
        }

        // 6. Attach user to request
        req.user = {
            id: user._id,
            vipLevel: user.vip_level,
            sessionId: decoded.sessionId,
            ipAddress: req.ip
        };

        // 7. Update last login if this is a fresh request
        if (!req.path.includes('/tasks') && !req.path.includes('/earnings')) {
            user.last_login = new Date();
            await user.save();
        }

        next();
    } catch (error) {
        // 8. Handle failed login attempts
        if (error instanceof jwt.JsonWebTokenError) {
            await handleFailedUserLogin(req);
        }
        res.status(401).send({ 
            success: false,
            error: 'User authentication failed',
            details: error.message 
        });
    }
};

async function handleFailedUserLogin(req: Request) {
    const { phone_number, email } = req.body;
    if (!phone_number && !email) return;

    const user = await User.findOne({ 
        $or: [{ phone_number }, { email }],
        account_status: 'active'
    });
    
    if (user) {
        user.login_attempts += 1;
        if (user.login_attempts >= 5) {
            user.is_locked = true;
            await Suspension.create({
                user_id: user._id,
                reason: 'Too many failed login attempts',
                status: 'active',
                start_date: new Date(),
                end_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            });
        }
        await user.save();
    }
}