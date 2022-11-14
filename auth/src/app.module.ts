import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';

import { prismaLoggingMiddleware } from '@/common/middlewares/prisma-logging.middleware';

import config from './common/configs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        explicitConnect: true,
        middlewares: [prismaLoggingMiddleware(new Logger('PrismaMiddleware'))],
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
