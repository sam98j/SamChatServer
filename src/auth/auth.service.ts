import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginSucc } from '../users/users.interface';
import { UsersService } from '../users/users.service';
import { RegisterDTO } from './auth.interface';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService, private client: OAuth2Client) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!);
  }
  // login method
  login(user: LoginSucc): { access_token: string; user: LoginSucc } {
    const payload = { email: user.email, sub: user._id };
    return { access_token: this.jwtService.sign(payload), user };
  }
  // signup service
  async signUp(newUsr: RegisterDTO) {
    try {
      const user = await this.usersService.addUser(newUsr);
      if (!user) return null;
      const token_payload = { email: newUsr.email, sub: user._id };
      return { user, access_token: this.jwtService.sign(token_payload) };
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // sign up with google
  async signUpWithGoogle(tokenId: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: tokenId.slice(7),
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, picture, name } = ticket.getPayload();
    // create usr dto
    const newUsrDto: RegisterDTO = {
      email,
      name,
      usrname: name.split(' ')[0],
      avatar: picture,
    };
    try {
      const user = await this.usersService.getUserByCred({ email, password: '' });
      // check if usr is not exist
      if (user) return { access_token: this.jwtService.sign({ email: user.email, sub: user._id }), user };
      // sign up new usr
      const signUpRes = await this.signUp(newUsrDto);
      // return
      return signUpRes;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
