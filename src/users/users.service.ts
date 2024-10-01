import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';
import { ChatUserProfile, LoginSucc } from './users.interface';
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
      // check for password existence (in case of google sign in there is no password)
      if (user.password) {
        // password salt
        const salt = await bcrypt.genSalt();
        // hashed password
        const hashedPassword = await bcrypt.hash(user.password, salt);
        // replace regular pass with encypted one
        user.password = hashedPassword;
      }
      // set usr as online
      const { name, avatar, email, _id } = await new this.userModel({ ...user, onlineStatus: 'online' }).save();
      // create new usr response
      const createdUser = { name, avatar, _id, email };
      // return
      return createdUser;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // get user
  async getUserByCred(loginDTO: LoginDTO) {
    try {
      // try to get a user from db by cred.
      const user = await this.userModel.findOne({ email: loginDTO.email }, { __v: 0 });
      // check if user is not null (user is exist)
      if (user && loginDTO.password !== '') {
        // compare provided password by user with the sotored password in db
        const match = await bcrypt.compare(loginDTO.password, user!.password);
        // remove password from response object
        user.password = undefined;
        // return fetched usr if the tow password are matched
        if (match) return user;
        // return null if no match
        return null;
      }
      // in case of loggin with google sign in
      if (user && loginDTO.password === '') return user; //
      // return null if no match
      return null;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // update connected user socket_id
  async updateUserSocketId(usrData: { _id: string; socket_id: string }) {
    try {
      // try to get a user from db by cred.
      const updateResponse = await this.userModel.updateOne(
        { _id: usrData._id },
        { $set: { socket_id: usrData.socket_id } },
      );
      // check if user is not null (user is exist)
      if (!updateResponse) return false;
      // if there is no error
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // get the socket id of the user
  async getUserNotificationAdress(usersIDs: string[]) {
    try {
      // try to get a user from db by cred.
      const users = await this.userModel.find(
        { _id: { $in: usersIDs } },
        { socket_id: 1, pushNotificationSubscription: 1 },
      );
      // return
      return users as Pick<UserDocument, 'pushNotificationSubscription' | 'socket_id' | '_id'>[];
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // get Users By usrname
  async getUsrsByUsrname(usrname: string) {
    // aggregate query
    const aggregateQuery = [
      { $match: { usrname: { $regex: usrname } } },
      { $project: { password: 0, email: 0, chats: 0 } },
    ];
    try {
      // get users they quered by the current user
      const matchedUsrs = await this.userModel.aggregate(aggregateQuery);
      // return null if no matched users
      if (!matchedUsrs) return null;
      // otherwize return matchedUsers
      return matchedUsrs;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // get user name
  async getUserData(usrid: string): Promise<Pick<LoginSucc, 'avatar' | 'name'>> {
    try {
      const { avatar, name } = await this.userModel.findOne({ _id: usrid }, { name: 1, _id: 0, avatar: 1 });
      // check for null
      if (!avatar && !name) return null;
      // no err
      return { avatar, name };
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // set usr onine status
  async setUsrOnlineStatus(cUsrId: string, status: string) {
    try {
      const dbResponse = await this.userModel.updateOne({ _id: cUsrId }, { $set: { onlineStatus: status } });
      // if usr is not updated
      if (!dbResponse) return false;
      // return
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // get user onlineStatus
  async getUserOnlineStatus(usrId: string): Promise<string> {
    try {
      const { onlineStatus } = await this.userModel.findOne({ _id: usrId }, { onlineStatus: 1, _id: 0 });
      // check for null
      if (!onlineStatus) return null;
      // return
      return onlineStatus;
    } catch (err) {
      return Promise.reject(err);
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
      return Promise.reject(error);
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
      const updateRes = await this.userModel.updateOne(
        { _id: usrId },
        { $set: { pushNotificationSubscription: subscription } },
      );
      // if no usr has been updated
      if (updateRes.modifiedCount === 0) return false;
      // return
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // save usr push notification subscription
  async deletePushNotificationSubscription(usrId: string) {
    try {
      const updateRes = await this.userModel.updateOne(
        { _id: usrId },
        { $set: { pushNotificationSubscription: null } },
      );
      // if no usr has been updated
      if (updateRes.modifiedCount === 0) return false;
      // return
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
