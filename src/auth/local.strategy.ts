import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {BadGatewayException, Injectable, UnauthorizedException} from '@nestjs/common';
// import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private userService: UsersService){
		super({usernameField: 'email'});
	}
	// validate method
	async validate(username: string, password: string){
		try {
			const user = await this.userService.getUserByCred({email: username, password});
			// if user is not authentecated
			if(!user) {
				throw new UnauthorizedException();
			}
			return user;
		} catch (error) {throw new BadGatewayException;}
	}
}