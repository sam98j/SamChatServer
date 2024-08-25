import { Module } from '@nestjs/common';
import { ChatService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chats.schema';
import { ChatsController } from './chats.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }])],
  providers: [ChatService],
  exports: [MongooseModule, ChatService],
  controllers: [ChatsController],
})
export class ChatsModule {}
