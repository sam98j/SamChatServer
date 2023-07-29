import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
        super({usernameField: "email"})
    }
    // validate method
    async validate(username: string, password: string): Promise<any>{
        const user = this.authService.validateUser(username, password);
        // if user is not authentecated
        if(!user) {
            throw new UnauthorizedException();
        }
        return user
    }
}