import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chats.service';
import { ChatMember, SingleChat } from './chats.interfaces';
import { MessagesService } from 'src/messages/messages.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chats')
export class ChatsController {
  constructor(
    private userService: UsersService,
    private chatService: ChatService,
    private messagesService: MessagesService,
  ) {}

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
  @UseInterceptors(FileInterceptor('avatar'))
  async createGroupChat(@Body('chat') groupChatDTO: string, @UploadedFile() file: Express.Multer.File) {
    // parse chat
    const chat = JSON.parse(groupChatDTO) as SingleChat;
    // urs profile image url
    const avatarPath = file ? `/${file.originalname}` : '';
    // set group avatar
    chat.avatar = avatarPath;
    try {
      // create new chat
      await this.chatService.addNewChat(chat);
      // return true
      return true;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }

  // delete chat
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteChat(@Param('id') _id: string) {
    try {
      // check if there is messages in this  chat
      const messages = await this.messagesService.getChatMessages(_id, 1, 1);
      // terminate if there is messages related to this chat
      if (messages.chatMessages.length !== 0) return;

      // if chat is deleted
      await this.chatService.deleteChat(_id);
      // return true
      return true;
      // return deleteChatRes;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  // add chat members
  @UseGuards(AuthGuard('jwt'))
  @Post('/addmembers/:id')
  async addChatMembers(@Param('id') _id: string, @Body() members: ChatMember[]) {
    try {
      // add chat's members
      const addMembersRes = await this.chatService.addChatMembers(_id, members);
      // check for null
      return addMembersRes;
    } catch (err) {
      return new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
