import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginSucc } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { RegisterDTO } from './auth.interface';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}
	// login method
	login(user: LoginSucc): {access_token: string, user: LoginSucc} {
		const payload = {email: user.email, sub: user._id};
		return {
			access_token: this.jwtService.sign(payload),
			user
		};
	}
	// signup service
	async signUp(newUsr: RegisterDTO){
		try {
			const user = await this.usersService.addUser(newUsr);
			if(!user) return null;
			const token_payload = {email: newUsr.email, sub: user._id};
			return {user, access_token: this.jwtService.sign(token_payload)};
		} catch (error) {return Promise.reject(error);}
	}
}
