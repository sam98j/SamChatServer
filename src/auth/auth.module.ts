import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import e from 'express';
import { multerConfig } from 'src/config/multer';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    OAuth2Client,
    JwtModule.register({ secret: JwtConstants.secret }),
    ConfigModule,
    MulterModule.register({ storage: multerConfig }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, OAuth2Client],
  exports: [UsersModule, UsersService, AuthService, JwtModule, MulterModule, OAuth2Client],
})
export class AuthModule {}
