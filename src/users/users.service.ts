import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';
import { LoginSucc, SingleChat } from './users.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<User>) {}
	// add new user
	async addUser(user: RegisterDTO) {
		try {
			// get usr by email or usrname
			const usr = await this.userModel.findOne({$or: [{ email: user.email }, { usrname: user.usrname }]});
			// check if usr exist
			if (usr) {return null;}
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(user.password, salt);
			user.password = hashedPassword;
			const newUsr = new this.userModel({...user, onlineStatus: 'online'});
			newUsr.save();
			return {name: newUsr.name, email: newUsr.email, avatar: newUsr.avatar, _id: newUsr.id} as UserDocument;
		} catch (error) {return Promise.reject('db err');}
	}
	// get user
	async getUserByCred(user: LoginDTO) {
		try {
			// try to get a user from db by cred.
			const response = await this.userModel.findOne({email: user.email}, {__v: 0});
			// check if user is not null (user is exist)
			if (response) {
				const match = await bcrypt.compare(user.password, response!.password);
				response.password = undefined;
				if(match) return response;
				return null;
			}
			return null;
		} catch (err) {return Promise.reject(err);}
	}
	// update connected user socket_id
	async updateUserSocketId(usrData: { _id: string; socket_id: string }) {
		try {
			// try to get a user from db by cred.
			const userdata = await this.userModel.updateOne(
				{ _id: usrData._id },
				{ $set: { socket_id: usrData.socket_id } },
			);
			// check if user is not null (user is exist)
			if (userdata) {
				return userdata;
			}
			return null;
		} catch (err) {
			return err;
		}
	}
	// get the socket id of the user
	async getUserSocketId(usrId: string) {
		try {
			// try to get a user from db by cred.
			const userSocketId = await this.userModel.findOne(
				{ _id: usrId },
				{ socket_id: 1, _id: 0 },
			);
			// check if user is not null (user is exist)
			if (userSocketId) {return userSocketId;}
			return null;
		} catch (err) {return Promise.reject('db error');}
	}
	// get users chats
	async getUserChats(usrId: string): Promise<SingleChat[]> {
		try {
			const chats = await (
				await this.userModel.findOne({ _id: usrId }, { _id: 0 })
			).chats.reverse();
			// chceck for null
			if (chats) {
				return chats;
			}
			return null;
		} catch (err) {
			return err;
		}
	}
	// check for chat
	async checkForChatExist(cUsrId: string, chatUsrId: string): Promise<boolean> {
		try {
			const chats = await (
				await this.userModel.findOne({ _id: cUsrId }, { chats: 1 })
			).chats;
			// filter the chat to find chatUser
			const isChatUserExist = Boolean(
				chats.filter((chat) => chat.usrid === chatUsrId).length,
			);
			// check for null
			return isChatUserExist;
		} catch (err) {return Promise.reject('Db Error');}
	}
	// get Users By usrname
	async getUsrsByUsrname(usrname: string) {
		try {
			// get users they quered by the current user
			const matchedUsrs = (await this.userModel.aggregate([
				{
					$match: { usrname: { $regex: usrname } },
				},
				{
					$project: { password: 0, email: 0, chats: 0 },
				},
			])) as Omit<LoginSucc, 'email' | 'password'>[];
			if (matchedUsrs) {
				return matchedUsrs;
			}
			return null;
		} catch (err) {
			return err;
		}
	}
	// add new chat
	async addNewChat(userId: string, newChat: SingleChat) {
		try {
			await this.userModel.updateOne(
				{ _id: userId },
				{ $push: { chats: newChat } },
			);
			return 'chat added Succesfly';
		} catch (err) {
			return err;
		}
	}
	// get user name
	async getUserName(usrid: string): Promise<string> {
		try {
			const usrname = (
				await this.userModel.findOne({ _id: usrid }, { name: 1, _id: 0 })
			).name;
			// check for null
			if (!usrname) {
				return null;
			}
			// no err
			return usrname;
		} catch (err) {
			return err;
		}
	}
	// set usr onine status
	async setUsrOnlineStatus(cUsrId: string, status: string) {
		try {
			await this.userModel.updateOne(
				{ _id: cUsrId },
				{ $set: { onlineStatus: status } },
			);
			return '';
		} catch (err) {
			return err;
		}
	}
	// get user onlineStatus
	async getUserOnlineStatus(usrId: string): Promise<string> {
		try {
			const usrOnlineStatus = (
				await this.userModel.findOne(
					{ _id: usrId },
					{ onlineStatus: 1, _id: 0 },
				)
			).onlineStatus;
			// check for null
			if (usrOnlineStatus) {
				return usrOnlineStatus;
			}
			return 'error geting usr online status';
		} catch (err) {
			return err;
		}
	}
	// get user profile
	async getUsrProfileData(usrId: string){
		try {
			const usrProfileData = await this.userModel.findOne({_id: usrId}, {name: 1, avatar: 1, usrname: 1});
			if(usrProfileData)return usrProfileData;
			return null;
		} catch (error) {return Promise.reject('db error');}
	}
}
