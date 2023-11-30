/* eslint-disable no-mixed-spaces-and-tabs */
import {
  BadGatewayException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get(':usrname')
  async searchUser(@Request() req, @Param('usrname') usrname: string) {
    try {
      const fetchedUsers = await this.userService.getUsrsByUsrname(usrname);
      // check for success
      if (fetchedUsers) {
        return fetchedUsers;
      }
      throw new HttpException('Client err', HttpStatus.BAD_REQUEST);
    } catch (err) {
      throw new HttpException('Internal Server err', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
  // handle geting usr online status
  @Get('get_online_status/:id')
  async getOnlineStatus(@Param('id') id: string) {
    try {
      const usrOnlineStatus = await this.userService.getUserOnlineStatus(id);
      // check for null
      if (!usrOnlineStatus) {
        return new HttpException(null, HttpStatus.BAD_REQUEST);
      }
      return usrOnlineStatus;
    } catch (err) {
      return new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // get user Profile
  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string) {
    try {
      const usrname = await this.userService.getUsrProfileData(id);
      return usrname;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
  // get Chat Profile
  @Get('chat_profile/:id')
  async getChatPorfile(@Param('id') id: string) {
    try {
      const chatProfile = await this.userService.getChatProfile(id);
      // check for null
      if (!chatProfile) {
        return new HttpException(null, HttpStatus.BAD_REQUEST);
      }
      // there is no error
      return chatProfile;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
}
