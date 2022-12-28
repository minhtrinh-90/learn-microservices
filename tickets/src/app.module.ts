import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';

import { prismaLoggingMiddleware } from '@/common/middlewares/prisma-logging.middleware';

import { AppController } from './app.controller';
import config from './common/configs/config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        explicitConnect: true,
        middlewares: [prismaLoggingMiddleware(new Logger('PrismaMiddleware'))],
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
