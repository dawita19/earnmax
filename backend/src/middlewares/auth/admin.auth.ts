import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/admin.model';
import { AuditLog } from '../../models/audit-log.model';
import { AdminLevel } from '../../enums/admin-level.enum';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract token from headers
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Authentication required');
        }

        // 2. Verify JWT token
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as { 
            adminId: string;
            level: AdminLevel;
            sessionId: string;
        };

        // 3. Find admin with active session
        const admin = await Admin.findOne({
            _id: decoded.adminId,
            'sessions.sessionId': decoded.sessionId,
            is_active: true
        });

        if (!admin) {
            throw new Error('Admin not found or session expired');
        }

        // 4. Check admin level permissions
        const requestedPath = req.baseUrl + req.path;
        if (admin.level === 'low' && isHighLevelRoute(requestedPath)) {
            throw new Error('Insufficient privileges');
        }

        // 5. Attach admin to request
        req.admin = {
            id: admin._id,
            level: admin.level,
            permissions: admin.permissions,
            sessionId: decoded.sessionId
        };

        // 6. Log admin access
        await AuditLog.create({
            admin_id: admin._id,
            user_id: req.user?.id,
            action_type: 'ACCESS',
            description: `Accessed ${req.method} ${requestedPath}`,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        next();
    } catch (error) {
        // 7. Handle failed login attempts
        if (error instanceof jwt.JsonWebTokenError) {
            await handleFailedAdminLogin(req);
        }
        res.status(401).send({ 
            success: false,
            error: 'Admin authentication failed',
            details: error.message 
        });
    }
};

function isHighLevelRoute(path: string): boolean {
    const highLevelRoutes = [
        '/system/statistics',
        '/system/suspensions',
        '/system/loans'
    ];
    return highLevelRoutes.some(route => path.startsWith(route));
}

async function handleFailedAdminLogin(req: Request) {
    const ip = req.ip;
    const admin = await Admin.findOne({ 
        email: req.body.email,
        is_active: true 
    });
    
    if (admin) {
        admin.login_attempts += 1;
        if (admin.login_attempts >= 5) {
            admin.is_locked = true;
        }
        await admin.save();
    }
}