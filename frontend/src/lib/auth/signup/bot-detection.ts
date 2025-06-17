import { verify } from 'hcaptcha';
import { NextRequest } from 'next/server';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export class BotDetection {
  private static instance: BotDetection;
  private fpPromise: Promise<FingerprintJS.Loaded>;

  private constructor() {
    this.fpPromise = FingerprintJS.load();
  }

  public static getInstance(): BotDetection {
    if (!BotDetection.instance) {
      BotDetection.instance = new BotDetection();
    }
    return BotDetection.instance;
  }

  public async verifyHCaptcha(token: string): Promise<boolean> {
    try {
      const secret = process.env.HCAPTCHA_SECRET!;
      const { success } = await verify(secret, token);
      return success;
    } catch (error) {
      console.error('hCaptcha verification failed:', error);
      return false;
    }
  }

  public async getFingerprint(req: NextRequest): Promise<string> {
    const fp = await this.fpPromise;
    const result = await fp.get();
    return result.visitorId;
  }

  public async analyzeBehavior(req: NextRequest): Promise<number> {
    // Advanced bot detection scoring
    let score = 0;

    // 1. Check headers
    const headers = req.headers;
    if (!headers.get('user-agent')) score -= 20;
    if (!headers.get('accept-language')) score -= 10;

    // 2. Check timing (would need proper implementation)
    const requestTime = Date.now();
    const refererTime = parseInt(headers.get('x-request-time') || '0');
    if (requestTime - refererTime < 500) score -= 30; // Too fast

    // 3. Check fingerprint consistency
    const fp = await this.getFingerprint(req);
    if (fp !== req.cookies.get('fp_token')) score -= 40;

    return score;
  }

  public async isLikelyBot(req: NextRequest): Promise<boolean> {
    const hcaptchaToken = req.headers.get('x-hcaptcha-token');
    if (hcaptchaToken && !(await this.verifyHCaptcha(hcaptchaToken))) {
      return true;
    }

    const behaviorScore = await this.analyzeBehavior(req);
    return behaviorScore < -50;
  }
}