import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body } from 'express-validator';
import { VIPLevel } from '../../models/vipLevel';

export class RequestValidator {
  static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      res.status(400).json({
        success: false,
        errors: errors.array()
      });
    };
  }

  // Purchase Request Validation Rules
  static purchaseRequestRules(): ValidationChain[] {
    return [
      body('vip_level')
        .isInt({ min: 0, max: 8 })
        .withMessage('Invalid VIP level')
        .custom(async (level) => {
          const vipExists = await VIPLevel.exists({ level_id: level });
          if (!vipExists) {
            throw new Error('VIP level does not exist');
          }
          return true;
        }),
      body('payment_proof')
        .isURL()
        .withMessage('Invalid payment proof URL')
        .matches(/\.(jpg|jpeg|png|webp)$/i)
        .withMessage('Payment proof must be an image'),
      body('payment_method')
        .isIn(['telebirr', 'cbe', 'awash', 'boon'])
        .withMessage('Invalid payment method')
    ];
  }

  // Withdrawal Request Validation Rules
  static withdrawalRequestRules(): ValidationChain[] {
    return [
      body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be a positive number'),
      body('payment_method')
        .isString()
        .notEmpty()
        .withMessage('Payment method is required'),
      body('payment_details')
        .isObject()
        .withMessage('Payment details must be an object')
        .custom((details) => {
          if (!details.accountNumber || !details.accountName) {
            throw new Error('Invalid payment details');
          }
          return true;
        })
    ];
  }
}