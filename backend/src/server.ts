import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { setupSecurity } from './config/security.config';
import { setupWorkers } from './config/workers.config';

async function bootstrap() {
  const logger = new Logger('Server');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration
  setupSecurity(app, configService);
  setupSwagger(app);
  await setupWorkers(app);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, () => {
    logger.log(`Server running on port ${port}`);
    logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  });
}

bootstrap().catch(err => {
  console.error('Server failed to start', err);
  process.exit(1);
});