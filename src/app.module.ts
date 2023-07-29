import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AuthModule,MongooseModule.forRoot("mongodb://localhost:27017/ChatApp")],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
