import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chats.service';
import { SingleChat } from './chats.interfaces';

@Controller('chats')
export class ChatsController {
  constructor(private userService: UsersService, private chatService: ChatService) {}
  // get usr chats
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getUserChats(@Request() req) {
    try {
      const userChats = await this.chatService.getUserChats(req.user.userId as string);
      // get current usr data
      const { avatar, name } = await this.userService.getUserData(req.user.userId);
      // check for null
      if (!userChats) return null;
      // if usr is loggedin it will recive a list of chats
      return { chats: userChats, loggedInUser: { _id: req.user.userId, avatar, name } };
    } catch (err) {
      return new HttpException('Server Err', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // get Chat Profile
  @Get(':id')
  async getChat(@Param('id') id: string) {
    try {
      const chatProfile = await this.chatService.getChat(id);
      // check for null
      if (!chatProfile) return new HttpException(null, HttpStatus.BAD_REQUEST);
      // there is no error
      return chatProfile;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  // create chat group
  @UseGuards(AuthGuard('jwt'))
  @Post('/create_chat')
  async createGroupChat(@Body() groupChatDTO: SingleChat) {
    try {
      // create new chat
      await this.chatService.addNewChat(groupChatDTO);
      // return true
      return true;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
}
