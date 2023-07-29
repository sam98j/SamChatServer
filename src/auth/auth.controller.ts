import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './auth.interface';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @UseGuards(AuthGuard('local'))
    // implement login handler
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user)
    }
    // signup handler
    @Post('signup')
    async signup() {
        return ""
    }

    // profile route
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async profileHandler(@Request() req){
        return req.user
    }
}
