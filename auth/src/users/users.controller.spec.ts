import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { Response } from 'express';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { SignUpDto } from './dto/signup.dto';
import { Token } from './models/token.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  const tokenResult: Token = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  };
  const signUpInfo: SignUpDto = {
    email: 'test@test.com',
    password: '12345678',
  };
  const mockResponse = createMock<Response>({
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  });
  const currentUser = createMock<User>();

  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return createMock<UsersService>({
            signUp: jest.fn().mockResolvedValue(tokenResult),
            signIn: jest.fn().mockResolvedValue(tokenResult),
            signOut: jest.fn(),
          });
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

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findCurrentUser', () => {
    it('should return the current user', () => {
      expect(controller.findCurrentUser(currentUser)).toBe(currentUser);
    });
  });

  describe('signUp', () => {
    it('should call usersService.signUp & req.cookie', async () => {
      await controller.signUp(signUpInfo, mockResponse);
      expect(service.signUp).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });
    it('should return the correct token', async () => {
      const { accessToken, refreshToken } = await controller.signUp(
        signUpInfo,
        mockResponse,
      );
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });
  });

  describe('signIn', () => {
    it('should call usersService.signIn & req.cookie', async () => {
      await controller.signIn(signUpInfo, mockResponse);
      expect(service.signIn).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });
    it('should return the correct token', async () => {
      const { accessToken, refreshToken } = await controller.signUp(
        signUpInfo,
        mockResponse,
      );
      expect(accessToken).toEqual(tokenResult.accessToken);
      expect(refreshToken).toEqual(tokenResult.refreshToken);
    });
  });

  describe('signOut', () => {
    it('should call req.clearCookie', async () => {
      await controller.signOut(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(1);
      expect(service.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
