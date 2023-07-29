import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginSucc } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}
    // validate user method
    validateUser(username: string, pass: string): Promise<LoginSucc>{
        return new Promise(async (resolve, reject) => {
            // try to resolve promise
            try {
                // try to get usr by it's cred
                const user = await this.usersService.getUserByCred({email: username, password: pass});
                resolve(user)
            } catch(err: any){
                reject(err)
            }
        })
    }
    // login method
    login(user: LoginSucc): {access_token: string, user: LoginSucc} {
        const payload = {email: user.email, sub: user._id};
        return {
            access_token: this.jwtService.sign(payload),
            user
        }
    }
}
