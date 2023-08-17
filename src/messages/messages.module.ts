import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [UsersModule],
  providers: [MessagesGateway, UsersService],
  controllers: [MessagesController]
})
export class MessagesModule {}
