import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { encrypt, decrypt } from '../crypto';

interface TwoFactorConfig {
  secret: string;
  tempSecret: string;
  dataURL: string;
  otpURL: string;
}

export class Admin2FA {
  private static instance: Admin2FA;
  private secrets: Map<string, TwoFactorConfig> = new Map();

  private constructor() {}

  public static getInstance(): Admin2FA {
    if (!Admin2FA.instance) {
      Admin2FA.instance = new Admin2FA();
    }
    return Admin2FA.instance;
  }

  public async generateSecret(email: string): Promise<Omit<TwoFactorConfig, 'secret'>> {
    const secret = speakeasy.generateSecret({
      name: `EarnMaxElite:${email}`,
      length: 32
    });

    const tempSecret = encrypt(secret.base32);
    const dataURL = await QRCode.toDataURL(secret.otpauth_url!);

    this.secrets.set(email, {
      secret: secret.base32,
      tempSecret,
      dataURL,
      otpURL: secret.otpauth_url!
    });

    return {
      tempSecret,
      dataURL,
      otpURL: secret.otpauth_url!
    };
  }

  public verifyToken(email: string, token: string): boolean {
    const config = this.secrets.get(email);
    if (!config) return false;

    return speakeasy.totp.verify({
      secret: config.secret,
      encoding: 'base32',
      token,
      window: 1
    });
  }

  public confirm2FASetup(email: string, token: string): boolean {
    const verified = this.verifyToken(email, token);
    if (verified) {
      // Store the secret permanently for the user
      // This would typically be saved to your database
      return true;
    }
    return false;
  }

  public getStoredSecret(email: string): string | null {
    const config = this.secrets.get(email);
    return config ? config.tempSecret : null;
  }
}