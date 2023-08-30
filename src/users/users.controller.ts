/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, HttpException, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService){}
    @UseGuards(AuthGuard('jwt'))
    @Get(':usrname')
	async searchUser(@Request() req,  @Param('usrname') usrname: string){
		try {
			const fetchedUsers = await this.userService.getUsrsByUsrname(usrname);
			// check for success
			if(fetchedUsers) {
				return fetchedUsers;
			}
			throw new HttpException('Client err', HttpStatus.BAD_REQUEST);
		} catch(err) {throw new HttpException('Internal Server err', HttpStatus.SERVICE_UNAVAILABLE);}
	}
    // handle geting usr online status
    @Get('get_online_status/:id')
    async getOnlineStatus(@Param('id') id: string){
    	try {
    		const usrOnlineStatus = await this.userService.getUserOnlineStatus(id);
    		// check for null
    		if(!usrOnlineStatus) {
    			return new HttpException(null, HttpStatus.BAD_REQUEST);
    		}
    		return usrOnlineStatus;
    	} catch(err) {return new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);}
    }
}
