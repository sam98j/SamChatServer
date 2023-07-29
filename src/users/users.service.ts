import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';
import { LoginSucc } from './users.interface';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}
    // add new user
    async addUser(user: RegisterDTO) {
        return this.userModel.create(user);
    }
    // get user
    getUserByCred(user: LoginDTO): Promise<LoginSucc>{
        return new Promise(async (resolve, reject) => {
            try {
                // try to get a user from db by cred.
                const userdata = await this.userModel.findOne(user, {__v: 0, password: 0}) as LoginSucc | null
                // check if user is not null (user is exist)
                if(!null) {
                    resolve(userdata);
                    return
                }
                reject(null)
            } catch (err: any) {
                reject("server error")
            }
        })
    }
}
