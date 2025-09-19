import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadGatewayException, Injectable } from '@nestjs/common';
// import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({ usernameField: 'email' });
  }
  // validate method
  async validate(username: string, password: string) {
    try {
      const user = await this.userService.getUserByCred({ email: username, password });
      // if user is not authentecated
      if (user) return user;
      return;
    } catch (error) {
      throw new BadGatewayException();
    }
  }
}
