import { Request, Response, NextFunction } from 'express';
import { createLogger, transports, format } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

export class RequestLogger {
  private static logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/combined.log' }),
      new ElasticsearchTransport({
        level: 'info',
        client: new Client({ node: process.env.ELASTICSEARCH_URL }),
        indexPrefix: 'earnmax-logs'
      })
    ]
  });

  static logRequest(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?._id,
        adminId: req.assignedAdmin?._id,
        requestId: req.id
      };

      if (res.statusCode >= 400) {
        RequestLogger.logger.error('Request error', logData);
      } else {
        RequestLogger.logger.info('Request completed', logData);
      }
    });

    // Log request start
    RequestLogger.logger.debug('Request started', {
      method: req.method,
      url: req.originalUrl,
      body: this.sanitizeBody(req.body),
      headers: this.sanitizeHeaders(req.headers)
    });

    next();
  }

  private static sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'payment_details', 'token'];
    const sanitized = { ...body };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '*****';
      }
    });

    return sanitized;
  }

  private static sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '*****';
      }
    });

    return sanitized;
  }
}