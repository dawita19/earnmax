// backend/tests/unit/utils/security.util.test.ts
import {
  validatePaymentProof,
  checkIPRestriction,
  detectFraudPattern
} from '../../../src/utils/security.util';

describe('Security Utilities', () => {
  describe('Payment Proof Validation', () => {
    it('should detect valid proof images', async () => {
      const mockImage = Buffer.from('valid-image-data');
      const result = await validatePaymentProof(mockImage);
      expect(result.valid).toBe(true);
    });

    it('should reject tampered images', async () => {
      const mockImage = Buffer.from('tampered-data');
      const result = await validatePaymentProof(mockImage);
      expect(result.valid).toBe(false);
    });
  });

  describe('IP Restriction Checks', () => {
    it('should detect duplicate IPs', () => {
      const userIPs = ['192.168.1.1', '192.168.1.2', '192.168.1.1'];
      const result = checkIPRestriction(userIPs);
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicateIPs).toContain('192.168.1.1');
    });
  });

  describe('Fraud Pattern Detection', () => {
    it('should flag rapid withdrawals', () => {
      const withdrawals = [
        { amount: 100, timestamp: Date.now() - 1000 },
        { amount: 100, timestamp: Date.now() - 2000 },
        { amount: 100, timestamp: Date.now() - 3000 },
      ];
      expect(detectFraudPattern(withdrawals)).toBe(true);
    });
  });
});