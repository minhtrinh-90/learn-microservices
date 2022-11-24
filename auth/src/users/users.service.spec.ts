import { createMock } from '@golevelup/ts-jest';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { PrismaService } from 'nestjs-prisma';

import { SignUpDto } from './dto/signup.dto';
import { Token } from './models/token.model';
import { PasswordService } from './password.service';
import { UsersService } from './users.service';

const moduleMocker = new ModuleMocker(global);

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const userInfo: SignUpDto = {
    email: 'test@test.com',
    password: '12345678',
  };
  const user: User = createMock<User>({
    email: 'test@test.com',
    password: '12345678.hashed',
    id: 'id12345678',
  });
  const tokenResult: Token = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token == PrismaService) {
          return createMock<PrismaService>({
            user: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(user),
              findUnique: jest.fn().mockResolvedValue(user),
            },
          });
        }
        if (token == PasswordService) {
          return createMock<PasswordService>({
            hashPassword: jest.fn().mockResolvedValue('12345678.hashed'),
            validatePassword: jest.fn().mockResolvedValue(true),
          });
        }
        if (token == JwtService) {
          return createMock<JwtService>({
            sign: (_, options) => {
              if (!options) {
                return tokenResult.accessToken;
              }
              return tokenResult.refreshToken;
            },
            verify: jest.fn().mockReturnValue(user),
          });
        }
        if (token == ConfigService) {
          return createMock<ConfigService>();
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('signUp', () => {
    it('should call necessary functions & return the correct token for new user', async () => {
      jest.spyOn(usersService, 'generateTokens');
      const { accessToken, refreshToken } = await usersService.signUp(userInfo);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(passwordService.hashPassword).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(usersService.generateTokens).toHaveBeenCalledTimes(1);
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });

    it('should throw ConflictException if user already exists', () => {
      prismaService.user.findFirst = jest.fn().mockResolvedValue(user);
      expect(usersService.signUp(userInfo)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should call necessary functions & return the correct token', async () => {
      prismaService.user.findFirst = jest.fn().mockResolvedValue(user);
      jest.spyOn(usersService, 'generateTokens');
      const { accessToken, refreshToken } = await usersService.signIn(userInfo);

      expect(prismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(passwordService.validatePassword).toHaveBeenCalledTimes(1);
      expect(usersService.generateTokens).toHaveBeenCalledTimes(1);
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });

    it('should throw BadRequestException if user does not exist', () => {
      expect(usersService.signIn(userInfo)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if the password is wrong', () => {
      prismaService.user.findFirst = jest.fn().mockResolvedValue(user);
      passwordService.validatePassword = jest.fn().mockResolvedValue(false);
      expect(usersService.signIn(userInfo)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('signOut', () => {
    it('should return a string', () => {
      expect(typeof usersService.signOut()).toBe('string');
    });
  });

  describe('validateUser', () => {
    it('should return the user', () => {
      expect(usersService.validateUser(user.id)).resolves.toBe(user);
    });
  });

  describe('generateTokens', () => {
    it('should call the necessary functions & return the correct tokens', async () => {
      jest.spyOn(usersService as any, 'generateAccessToken');
      jest.spyOn(usersService as any, 'generateRefreshToken');
      const { accessToken, refreshToken } = await usersService.generateTokens({
        userId: 'id12345678',
      });

      expect(usersService['generateAccessToken']).toHaveBeenCalledTimes(1);
      expect(usersService['generateRefreshToken']).toHaveBeenCalledTimes(1);
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });
  });

  describe('generateAccessToken', () => {
    it('should call the necessary functions & return the correct token', async () => {
      const token = await usersService['generateAccessToken']({
        userId: 'id12345678',
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(token).toEqual(tokenResult.accessToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should call the necessary functions & return the correct token', async () => {
      const token = await usersService['generateRefreshToken']({
        userId: 'id12345678',
      });

      expect(configService.get).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(token).toEqual(tokenResult.refreshToken);
    });
  });

  describe('refreshToken', () => {
    it('should call the necessary functions & return the correct tokens', async () => {
      jest.spyOn(usersService, 'generateTokens');
      const { accessToken, refreshToken } = await usersService.refreshToken(
        tokenResult.refreshToken,
      );

      expect(jwtService.verify).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledTimes(3);
      expect(usersService.generateTokens).toHaveBeenCalledTimes(1);
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });

    it('should throw UnauthorizedException if the refresh token is invalid', () => {
      jwtService.verify = jest.fn(() => {
        throw new Error();
      });
      expect(() =>
        usersService.refreshToken(tokenResult.refreshToken),
      ).toThrowError(UnauthorizedException);
    });
  });
});
