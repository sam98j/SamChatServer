/* eslint-disable no-mixed-spaces-and-tabs */
import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDTO } from './auth.interface';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }
  // signup handler
  @Post('signup')
  @UseInterceptors(FileInterceptor('profile_img'))
  async signup(@Req() req: Request, @Body() usrDTO: RegisterDTO, @UploadedFile() file: Express.Multer.File) {
    const profileImgURL = file ? `/${file.originalname}` : '';
    usrDTO.avatar = profileImgURL;
    try {
      const usr = await this.authService.signUp(usrDTO);
      // check form null
      if (usr) {
        return usr;
      }
      return new BadRequestException('User is Already Exist');
    } catch (error) {
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
