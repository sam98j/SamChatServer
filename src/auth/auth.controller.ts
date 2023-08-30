/* eslint-disable no-mixed-spaces-and-tabs */
import { BadRequestException, Body, Controller, HttpException, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { RegisterDTO } from './auth.interface';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}
    @UseGuards(AuthGuard('local'))
    @Post('login')
	async login(@Request() req) {
		return this.authService.login(req.user);
	}
    // signup handler
    @Post('signup')
    async signup(@Body() usrDTO: RegisterDTO) {
    	try {
    		const usr = await this.authService.signUp(usrDTO);
    		// check form null
    		if(usr){return usr;}
    		return new BadRequestException('User is Already Exist');
    	} catch (error) {
    		return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    	}
    }
}
