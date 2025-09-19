/* eslint-disable no-mixed-spaces-and-tabs */
import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { LoggedInUsrProfile } from './users.interface';
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
  // subscribe to push notifications
  @UseGuards(AuthGuard('jwt'))
  @Post('save-subscription')
  async savePushNotificationSubscription(@Body() subscription: PushSubscription, @Req() req) {
    try {
      const res = await this.userService.savePushNotificationSubscription(req.user.userId, subscription);
      return res;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
  // delete push subscription
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete_push_sub')
  async deletePushNotificationSubscription(@Req() req) {
    try {
      const res = await this.userService.deletePushNotificationSubscription(req.user.userId);
      return res;
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
  // get usr settings page
  @UseGuards(AuthGuard('jwt'))
  @Post('/settings')
  async getUserSettings(@Req() req) {
    try {
      const users = await this.userService.getUserNotificationAdress([req.user.userId]);
      // users setting obj
      const userSettings = {
        pushNotifications: null,
      };
      // check for push subscription
      if (!users[0].pushNotificationSubscription) return { ...userSettings, pushNotifications: false };
      // return true
      return { ...userSettings, pushNotifications: true };
    } catch (error) {
      throw new BadGatewayException('');
    }
  }
}
