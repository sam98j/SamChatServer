import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';
import { ChatProfile, LoginSucc, SingleChat } from './users.interface';
import * as bcrypt from 'bcrypt';
import { validateEmailInput } from 'src/utils/validations';
import { PushSubscription } from 'web-push';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  // add new user
  async addUser(user: RegisterDTO) {
    try {
      // get usr by email or usrname
      const usr = await this.userModel.findOne({ $or: [{ email: user.email }, { usrname: user.usrname }] });
      // check if usr exist
      if (usr) return null;
      // password salt
      const salt = await bcrypt.genSalt();
      // hashed password
      const hashedPassword = await bcrypt.hash(user.password, salt);
      // replace regular pass with encypted one
      user.password = hashedPassword;
      const newUsr = new this.userModel({ ...user, onlineStatus: 'online' });
      newUsr.save();
      return { name: newUsr.name, email: newUsr.email, avatar: newUsr.avatar, _id: newUsr.id } as UserDocument;
    } catch (error) {
      return Promise.reject('db err');
    }
  }
  // get user
  async getUserByCred(user: LoginDTO) {
    try {
      // try to get a user from db by cred.
      const response = await this.userModel.findOne({ email: user.email }, { __v: 0 });
      // check if user is not null (user is exist)
      if (response) {
        const match = await bcrypt.compare(user.password, response!.password);
        response.password = undefined;
        if (match) return response;
        return null;
      }
      return null;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // update connected user socket_id
  async updateUserSocketId(usrData: { _id: string; socket_id: string }) {
    try {
      // try to get a user from db by cred.
      const userdata = await this.userModel.updateOne({ _id: usrData._id }, { $set: { socket_id: usrData.socket_id } });
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
  async getUserNotificationAdress(usrId: string) {
    try {
      // try to get a user from db by cred.
      const { socket_id, pushNotificationSubscription } = await this.userModel.findOne(
        { _id: usrId },
        { socket_id: 1, pushNotificationSubscription: 1 },
      );
      // return
      return { socket_id, pushNotificationSubscription };
    } catch (err) {
      return Promise.reject('db error');
    }
  }
  // get users chats
  async getUserChats(usrId: string): Promise<SingleChat[]> {
    try {
      const { chats } = await await this.userModel.findOne({ _id: usrId }, { _id: 0, chats: 1 });
      // chceck for null
      if (!chats) return null;
      return chats.reverse();
    } catch (err) {
      return err;
    }
  }
  // check for chat
  async checkForChatExist(cUsrId: string, chatUsrId: string): Promise<boolean> {
    try {
      const chats = await (await this.userModel.findOne({ _id: cUsrId }, { chats: 1 })).chats;
      // filter the chat to find chatUser
      const isChatUserExist = Boolean(chats.filter((chat) => chat.usrid === chatUsrId).length);
      // check for null
      return isChatUserExist;
    } catch (err) {
      return Promise.reject('Db Error');
    }
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
      await this.userModel.updateOne({ _id: userId }, { $push: { chats: newChat } });
      return 'chat added Succesfly';
    } catch (err) {
      return err;
    }
  }
  // get user name
  async getUserData(usrid: string): Promise<Pick<LoginSucc, 'avatar' | 'name'>> {
    try {
      const { avatar, name } = await this.userModel.findOne({ _id: usrid }, { name: 1, _id: 0, avatar: 1 });
      // check for null
      if (!avatar && !name) {
        return null;
      }
      // no err
      return { avatar, name };
    } catch (err) {
      return err;
    }
  }
  // set usr onine status
  async setUsrOnlineStatus(cUsrId: string, status: string) {
    try {
      await this.userModel.updateOne({ _id: cUsrId }, { $set: { onlineStatus: status } });
      return '';
    } catch (err) {
      return err;
    }
  }
  // get user onlineStatus
  async getUserOnlineStatus(usrId: string): Promise<string> {
    try {
      const usrOnlineStatus = (await this.userModel.findOne({ _id: usrId }, { onlineStatus: 1, _id: 0 })).onlineStatus;
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
  async getUsrProfileData(usrId: string) {
    // warning implementing database ObjectId validation first
    try {
      // usr profile data
      const usrProfileData = await this.userModel.findOne({ _id: usrId }, { name: 1, avatar: 1, usrname: 1, email: 1 });
      // check if usr is not found
      if (!usrProfileData) return null;
      // return founded usr
      return usrProfileData;
    } catch (error) {
      return Promise.reject('db error');
    }
  }
  // get chat profile
  async getChatProfile(chatId: string) {
    try {
      const chatProfile = (await this.userModel.findOne(
        { _id: chatId },
        { name: 1, email: 1, avatar: 1 },
      )) as ChatProfile;
      // check for error
      if (!chatProfile) return null;
      // there's no error
      return chatProfile;
    } catch (error) {
      return Promise.reject('db err');
    }
  }
  // update usr profile data
  async updateUsrProfileData(currentUsrId: string, profileField: { fieldname: string; value: string }) {
    // destruct profile data
    const { fieldname, value } = profileField;
    try {
      // check for email input
      if (fieldname === 'email') {
        // email format validation
        const isEmail = validateEmailInput(value);
        // if it's not an email
        if (!isEmail) return new Error('your email it is not an valid email');
        // check if email is exist
        const usr = await this.userModel.findOne({ email: value });
        // if there're usr linked with this email the throw an error
        if (usr) return new Error('email is already exist, try another one');
      }
      // check for usrname input
      if (fieldname === 'usrname') {
        // check if email is exist
        const usr = await this.userModel.findOne({ usrname: value });
        // if there're usr linked with this email the throw an error
        if (usr) return new Error('there are another usr with this usrname');
      }
      await this.userModel.updateOne({ _id: currentUsrId }, { $set: { [fieldname]: value } });
      // `usr ${fieldname} is updated successfully`
      return true;
    } catch (error) {
      return Promise.reject('database error');
    }
  }
  // save usr push notification subscription
  async savePushNotificationSubscription(usrId: string, subscription: PushSubscription) {
    try {
      await this.userModel.updateOne({ _id: usrId }, { $set: { pushNotificationSubscription: subscription } });
      // TODO handle db insertion error
      // `usr ${fieldname} is updated successfully`
      console.log('succeeded');
      return true;
    } catch (error) {
      return Promise.reject('database error');
    }
  }
}
