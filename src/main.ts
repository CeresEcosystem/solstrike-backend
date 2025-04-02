import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import {
  TelegramLogger,
  LoggingInterceptor,
  HttpExceptionFilter,
  NotFoundExceptionFilter,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

const DEV_ENV = 'dev';

const INTERCEPTOR_URL_THRESHOLDS = [
  {
    url: '/api/demeter',
    warn: 5000,
    error: 20000,
  },
];

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // waits for TelegramLogger to be instantiated
  });

  // https://docs.nestjs.com/techniques/logger#dependency-injection
  // Use TelegramLogger only if env variables are set
  if (
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_ERROR_CHAT_ID &&
    process.env.TELEGRAM_WARN_CHAT_ID
  ) {
    app.useLogger(app.get(TelegramLogger));
  }

  app.enableCors();

  app.useGlobalInterceptors(new LoggingInterceptor(INTERCEPTOR_URL_THRESHOLDS));

  // https://docs.nestjs.com/exception-filters#exception-filters-1
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new NotFoundExceptionFilter(),
  );

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // https://docs.nestjs.com/faq/global-prefix
  app.setGlobalPrefix('api');

  // https://docs.nestjs.com/openapi/introduction
  if (process.env.APP_ENV === DEV_ENV) {
    const swaggerConfig = buildSwaggerConfig();
    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/swagger', app, swaggerDoc);
  }

  // Allows class-validator to use NestJS dependency injection container.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT);
}

function buildSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Deo Backend')
    .setVersion('2.0')
    .addBearerAuth({
      type: 'http',
      in: 'Header',
    })
    .build();
}

bootstrap();
