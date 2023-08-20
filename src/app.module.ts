import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesGateway } from './messages/messages.gateway';
import { MessagesModule } from './messages/messages.module';
import { MessagesController } from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [AuthModule,MongooseModule.forRoot("mongodb://localhost:27017/ChatApp"), MessagesModule, ConfigModule.forRoot({isGlobal: true})],
  controllers: [AuthController, MessagesController],
  providers: [AuthService, MessagesGateway, MessagesService],
})
export class AppModule {}
