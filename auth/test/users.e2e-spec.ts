import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.enableShutdownHooks(app);

    const configService = moduleFixture.get<ConfigService>(ConfigService);
    app.use(cookieParser(configService.get<string>('JWT_ACCESS_SECRET')));

    await app.init();
  });

  afterAll(async () => {
    const deleteUsers = prismaService.user.deleteMany();

    await prismaService.$transaction([deleteUsers]);
  });

  describe('/signup', () => {
    it('should return status 201, set JWT cookie and create a new user', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test@test.com',
          password: '12345678',
        })
        .expect(201)
        .expect('set-cookie', /^jwt/);
      expect(prismaService.user.findMany()).resolves.toHaveLength(1);
    });

    it('should return status 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test@test.com',
          password: '12345678',
        })
        .expect(409);
    });

    it('should return status 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test',
          password: '12345678',
        })
        .expect(400);
    });

    it('should return status 400 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          email: 'test@test.com',
          password: '1234',
        })
        .expect(400);
    });

    it('should return status 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({})
        .expect(400);
    });
  });
});
