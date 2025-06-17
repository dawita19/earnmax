import { verifyToken, generateToken } from '../../lib/auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Utilities', () => {
  const mockUser = {
    userId: 'user123',
    vipLevel: 2,
    role: 'user'
  };

  beforeEach(() => {
    (jwt.verify as jest.Mock).mockImplementation(() => mockUser);
    (jwt.sign as jest.Mock).mockImplementation(() => 'mockToken');
  });

  describe('verifyToken', () => {
    it('returns decoded token for valid token', async () => {
      const result = await verifyToken('validToken');
      expect(result).toEqual(mockUser);
    });

    it('throws error for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyToken('invalidToken')).rejects.toThrow('Invalid token');
    });
  });

  describe('generateToken', () => {
    it('generates token with correct payload', () => {
      const token = generateToken(mockUser);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockUser,
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(token).toBe('mockToken');
    });
  });
});