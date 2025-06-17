import { Request, Response, NextFunction } from 'express';
import { Admin } from '../../models/admin.model';
import { SystemSetting } from '../../models/system-setting.model';

export const ipWhitelist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip IP check for these paths
        if (req.path === '/healthcheck' || req.path.startsWith('/public')) {
            return next();
        }

        const clientIp = req.ip || req.connection.remoteAddress;
        
        // 1. Check admin IP whitelist
        if (req.admin) {
            const admin = await Admin.findById(req.admin.id);
            if (admin && admin.ip_whitelist && admin.ip_whitelist.length > 0) {
                if (!admin.ip_whitelist.includes(clientIp)) {
                    throw new Error(`IP ${clientIp} not authorized for admin access`);
                }
            }
        }

        // 2. Check system-wide IP restrictions
        const ipRestrictions = await SystemSetting.findOne({ key: 'ip_restrictions' });
        if (ipRestrictions) {
            const { blacklist, allowed_countries } = ipRestrictions.value;
            
            // Check blacklist
            if (blacklist.includes(clientIp)) {
                throw new Error('Access from this IP is restricted');
            }

            // Country check (would integrate with GeoIP service)
            // const country = await getCountryFromIp(clientIp);
            // if (allowed_countries.length > 0 && !allowed_countries.includes(country)) {
            //     throw new Error('Access from your country is restricted');
            // }
        }

        // 3. Check for suspicious IP patterns (multiple accounts)
        if (req.user) {
            const accountsFromIp = await User.countDocuments({ 
                ip_address: clientIp,
                account_status: 'active',
                _id: { $ne: req.user.id }
            });
            
            if (accountsFromIp >= 3) {
                await Suspension.create({
                    user_id: req.user.id,
                    reason: 'Suspicious IP activity (multiple accounts)',
                    status: 'active',
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
                });
                throw new Error('Account suspended for suspicious activity');
            }
        }

        next();
    } catch (error) {
        res.status(403).send({ 
            success: false,
            error: 'Access restricted',
            details: error.message 
        });
    }
};