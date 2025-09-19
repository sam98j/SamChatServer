import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './messages.scheam';
import { MessagesService } from './messages.service';
import { FileService } from 'src/services/files';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports: [ChatsModule, UsersModule, MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  providers: [MessagesGateway, UsersService, MessagesService, FileService],
  controllers: [MessagesController],
  exports: [MongooseModule, FileService],
})
export class MessagesModule {}
