/* eslint-disable no-mixed-spaces-and-tabs */
import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateGroupChatDTO, LoggedInUsrProfile, SingleChat } from './users.interface';
import { PushSubscription } from 'web-push';

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
      // get profile data
      const { email, _id, name, usrname, avatar } = await this.userService.getUsrProfileData(id);
      // unhandlled usr not found, please handle it
      // usr profile data
      const loggedInUsrProfileData: LoggedInUsrProfile = { _id, avatar, email, name, usrname };
      // response with logggedIn usr profile data
      return loggedInUsrProfileData;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  // update profile data api
  @UseGuards(AuthGuard('jwt'))
  @Put('profile?')
  async updateProfileData(@Query('fieldname') fieldname: string, @Query('value') value: string, @Req() req) {
    try {
      const updateUsrProfileRes = await this.userService.updateUsrProfileData(req.user.userId, { fieldname, value });
      // check if profile field is not updated succ
      if (updateUsrProfileRes !== true) return new BadRequestException(updateUsrProfileRes);
      // profile updated succ
      return { status: 200, err: false, msg: `usr ${fieldname} is updated successfully` };
    } catch (error) {
      return new BadGatewayException(error);
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
  // subscribe to push notifications
  @UseGuards(AuthGuard('jwt'))
  @Post('save-subscription')
  async savePushNotificationSubscription(@Body() subscription: PushSubscription, @Req() req) {
    console.log(subscription);
    try {
      const res = await this.userService.savePushNotificationSubscription(req.user.userId, subscription);
      return res;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
  // create chat group
  @UseGuards(AuthGuard('jwt'))
  @Post('create_group_chat')
  async createGroupChat(@Body() groupChatDTO: SingleChat, @Req() req) {
    // group members ids
    const groupMembersIDs = groupChatDTO.members.map((member) => member._id);
    try {
      // loop throw group's members IDs
      for (let memberId of groupMembersIDs) {
        // add chat for each chat's member
        await this.userService.addNewChat(memberId.toString(), groupChatDTO);
      }
      // return true
      return true;
    } catch (error) {
      throw new BadGatewayException('');
    }
    console.log(groupChatDTO, req.user.userId);
  }
}
