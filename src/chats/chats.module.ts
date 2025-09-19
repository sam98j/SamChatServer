import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chats.schema';
import { ChatsController } from './chats.controller';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => MessagesModule),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  providers: [ChatService, MessagesService],
  exports: [MongooseModule, ChatService],
  controllers: [ChatsController],
})
export class ChatsModule {}
