import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: false,
  },
  swagger: {
    enabled: true,
    title: 'Auth Module',
    description: 'The auth module API description',
    version: '0.1',
    path: 'api',
  },
  security: {
    expiresIn: '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  cookie: {
    httpOnly: true,
    sameSite: true,
    secure: true,
    signed: true,
  },
};

export default (): Config => config;
