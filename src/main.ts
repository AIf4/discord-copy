import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:4321', credentials: true });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
