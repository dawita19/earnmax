import { Request, Response, NextFunction } from 'express';
import speakeasy from 'speakeasy';
import { Admin } from '../../models/admin.model';
import { User } from '../../models/user.model';
import { AuditLog } from '../../models/audit-log.model';

export const twoFactorAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip 2FA for these endpoints
        if (req.path.includes('/2fa/setup') || req.path.includes('/2fa/verify')) {
            return next();
        }

        const entity = req.admin ? req.admin : req.user;
        if (!entity) {
            return next(); // Public route
        }

        // 1. Get entity from DB
        const Model = req.admin ? Admin : User;
        const record = await Model.findById(entity.id);
        
        if (!record) {
            throw new Error('Account not found');
        }

        // 2. Check if 2FA is enabled
        if (!record.two_factor_enabled) {
            return next();
        }

        // 3. Verify 2FA token
        const token = req.header('X-2FA-Token') || req.body.twoFactorToken;
        if (!token) {
            throw new Error('Two-factor authentication required');
        }

        const verified = speakeasy.totp.verify({
            secret: record.two_factor_secret!,
            encoding: 'base32',
            token,
            window: 1 // Allow 30s before/after window
        });

        if (!verified) {
            // Log failed attempt
            await AuditLog.create({
                [req.admin ? 'admin_id' : 'user_id']: entity.id,
                action_type: '2FA_FAILED',
                description: `Failed 2FA attempt from IP ${req.ip}`,
                ip_address: req.ip
            });

            throw new Error('Invalid two-factor token');
        }

        // 4. Successful verification
        await AuditLog.create({
            [req.admin ? 'admin_id' : 'user_id']: entity.id,
            action_type: '2FA_SUCCESS',
            description: `Successful 2FA verification`,
            ip_address: req.ip
        });

        next();
    } catch (error) {
        res.status(401).send({ 
            success: false,
            error: 'Two-factor authentication failed',
            details: error.message 
        });
    }
};

// Helper middleware for 2FA setup
export const twoFactorSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entity = req.admin ? req.admin : req.user;
        if (!entity) {
            throw new Error('Authentication required');
        }

        const Model = req.admin ? Admin : User;
        const record = await Model.findById(entity.id);
        
        if (!record) {
            throw new Error('Account not found');
        }

        // Generate new secret if not exists
        if (!record.two_factor_secret) {
            const secret = speakeasy.generateSecret({
                name: `EarnMaxElite:${record.email || record.phone_number}`,
                length: 20
            });

            record.two_factor_secret = secret.base32;
            await record.save();

            req.twoFactorSetup = {
                secret: secret.base32,
                otpauth_url: secret.otpauth_url
            };
        } else {
            req.twoFactorSetup = {
                secret: record.two_factor_secret,
                message: '2FA already configured'
            };
        }

        next();
    } catch (error) {
        res.status(400).send({ 
            success: false,
            error: '2FA setup failed',
            details: error.message 
        });
    }
};