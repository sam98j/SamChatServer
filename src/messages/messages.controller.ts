/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messageService: MessagesService) {}
  // chat's messages with specific usr (messages of a single chat)
  @UseGuards(AuthGuard('jwt'))
  @Get('/getchatmessages/:chaUsrtId')
  async chatMessagesHandler(@Param('chaUsrtId') chaUsrtId: string, @Query('msgs_batch') msgsBatch: number) {
    try {
      const res = await this.messageService.getChatMessages(chaUsrtId, 10, msgsBatch);
      return res;
    } catch (err) {
      return new HttpException('Internal Server err', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // upload voice
}
