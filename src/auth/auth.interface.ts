/* eslint-disable no-mixed-spaces-and-tabs */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail() email: string;
  @IsNotEmpty() password: string;
}

export class RegisterDTO {
  @IsEmail() email: string;
  @IsNotEmpty() password?: string;
  @IsNotEmpty() @IsString() name: string;
  @IsString() avatar?: string;
  @IsNotEmpty() @IsString() usrname: string;
}
