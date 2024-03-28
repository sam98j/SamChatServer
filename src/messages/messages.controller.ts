/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, HttpException, HttpStatus, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from './messages.service';
import { ChatPreviewData, MessageStatus, MessagesTypes } from './messages.interface';

@Controller('messages')
export class MessagesController {
  constructor(private userService: UsersService, private messageService: MessagesService) {}
  // profile route
  @UseGuards(AuthGuard('jwt'))
  @Get('chats')
  async profileHandler(@Request() req) {
    try {
      const userChats = await this.userService.getUserChats(req.user.userId as string);
      // check for null
      if (userChats) {
        return {
          chats: userChats,
          userId: req.user.userId,
        };
      }
      return null;
    } catch (err) {
      return err;
    }
  }
  // chat's message with specific usr
  @UseGuards(AuthGuard('jwt'))
  @Get('/getchatmessages/:chaUsrtId')
  async chatMessagesHandler(
    @Request() req,
    @Param('chaUsrtId') chaUsrtId: string,
    @Query('msgs_batch') msgsBatch: number,
  ) {
    try {
      const res = await this.messageService.getChatUsersMessages(req.user.userId, chaUsrtId, 10, msgsBatch);
      return res;
    } catch (err) {
      return new HttpException('Internal Server err', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // get chat preveiew data
  @UseGuards(AuthGuard('jwt'))
  @Get('/getchatpreviewdata/:chatUsrId')
  async chatPreviewData(@Request() req, @Param('chatUsrId') chatUsrId: string) {
    try {
      // get chat messages
      const { chatMessages } = await this.messageService.getChatUsersMessages(req.user.userId, chatUsrId, 5, 1);
      // get unReaded Messages
      const unReadedMsgs = chatMessages.filter(
        (msg) => msg.receiverId === req.user.userId && msg.status === MessageStatus.DELEVERED,
      ).length;
      // chat last message
      const { content, date, type, voiceNoteDuration, senderId, status } = chatMessages[chatMessages.length - 1];
      // chat preview data
      const chatPreviewData: ChatPreviewData = {
        type,
        lastMsgText: type === MessagesTypes.TEXT ? content : '',
        unReadedMsgs,
        voiceNoteDuration,
        senderId,
        status,
        date,
      };
      // return data
      return chatPreviewData;
    } catch (error) {
      return new HttpException('Server Err', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // upload voice
}
