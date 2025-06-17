import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestProcessor } from './workers/request.processor';
import { NotificationWorker } from './workers/notification.worker';
import { TaskWorker } from './workers/task.worker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EarnMax Elite API')
    .setDescription('The EarnMax Elite platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Initialize workers
  const requestProcessor = app.get(RequestProcessor);
  const notificationWorker = app.get(NotificationWorker);
  const taskWorker = app.get(TaskWorker);

  // Start background processing
  setInterval(() => requestProcessor.processPendingRequests(), 60000); // Every minute
  setInterval(() => notificationWorker.processUnsentNotifications(), 30000); // Every 30 seconds

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();