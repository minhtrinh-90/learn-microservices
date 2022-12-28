import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { CookieConfig } from '../common/configs/config.interface';
import { CurrentUser } from './current-user.decorator';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  findCurrentUser(@CurrentUser() user) {
    return user;
  }

  @Post('signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.usersService.signUp(
      signUpDto,
    );
    res.cookie(
      'jwt',
      accessToken,
      this.configService.get<CookieConfig>('cookie'),
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.usersService.signIn(
      signUpDto,
    );
    res.cookie(
      'jwt',
      accessToken,
      this.configService.get<CookieConfig>('cookie'),
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @HttpCode(200)
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', this.configService.get<CookieConfig>('cookie'));
    return this.usersService.signOut();
  }
}
