import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesGateway } from './messages/messages.gateway';
import { MessagesModule } from './messages/messages.module';
import { MessagesController } from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [AuthModule,MongooseModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory:async (configService: ConfigService) => ({uri: configService.get('MONGODB_URI')})
	}), MessagesModule, ConfigModule.forRoot({isGlobal: true})],
	controllers: [AuthController, MessagesController],
	providers: [AuthService, MessagesGateway, MessagesService],
})
export class AppModule {}
