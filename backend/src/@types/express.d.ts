import { UserDocument, AdminDocument } from './database';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      admin?: AdminDocument;
      requestId?: string;
      clientIp?: string;
    }

    interface Response {
      apiSuccess(data: any): Response;
      apiError(error: Error | string, code?: number): Response;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Router {
    ws(route: string, ...handlers: any[]): void;
  }
}