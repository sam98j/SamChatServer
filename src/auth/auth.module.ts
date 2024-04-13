import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ secret: JwtConstants.secret }),
    ConfigModule,
    MulterModule.register({ storage: multerConfig }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
  exports: [UsersModule, UsersService, AuthService, JwtModule, MulterModule],
})
export class AuthModule {}
