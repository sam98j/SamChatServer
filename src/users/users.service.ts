import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';
import { ChatMessage, LoginSucc, SingleChat } from './users.interface';

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
    // update connected user socket_id
    updateUserSocketId(usrData: {_id: string, socket_id: string}) {
        return new Promise(async (resolve, reject) => {
            try {
                // try to get a user from db by cred.
                const userdata = await this.userModel.updateOne({"_id": usrData._id}, 
                {$set: {socket_id: usrData.socket_id}
                })
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
    // get the socket id of the user
    getUserSocketId(usrId: string): Promise<Pick<LoginSucc, "socket_id">>{
        return new Promise(async (resolve, reject) => {
            try {
                // try to get a user from db by cred.
                const userSocketId = await this.userModel.findOne({"_id": usrId}, {socket_id: 1, _id: 0})
                // check if user is not null (user is exist)
                if(!null) {
                    resolve(userSocketId);
                    return
                }
                reject(null)
            } catch (err: any) {
                reject("server error")
            }
        })
    }
    // get users chats
    getUserChats(usrId: string): Promise<SingleChat[]>{
        return new Promise(async (resolve, reject) => {
            try {
                const {chats} = await this.userModel.findOne({_id: usrId}, {"chats.chatMessages": 0, _id: 0}) as {chats: SingleChat[]}
                // chceck for null
                if(chats){
                    resolve(chats)
                    return
                }
                reject(null)
            } catch(err: any){
                reject(err)
            }
        })
    }
    // get Users By usrname
    getUsrsByUsrname(usrname: string, currentUsr: string): Promise<{}[]>{
        return new Promise(async (resolve, reject) => {
            try {
                // get users they quered by the current user
                const matchedUsrs = await this.userModel.aggregate([{
                    $match: {usrname: {$regex: usrname}}},{
                    $project: {password: 0, email: 0, chats: 0}}
                ]) as Omit<LoginSucc, "email" | "password">[]
                // i need all the users chat id
                // if it's not null
                if(matchedUsrs) {
                    // get the current user chats
                    const currentUserChats = await (await this.userModel.findOne({"_id": currentUsr}, {chats: 1, _id: 0})).chats;
                    // filter cUser chats 
                    const filteredMatchedUsrs = matchedUsrs.map(usr => {
                        // loop all the queried users to get users has already chat with current user
                        if(currentUserChats.length === 0) return {...usr, chatId: ""}
                        for (let chat of currentUserChats) {
                            if(chat.chatWith.usrid === usr._id.toString()) {
                                return {...usr, chatId: chat.chatId}
                            }
                            return {...usr, chatId: ""}
                        }
                    })
                    resolve(filteredMatchedUsrs)
                    return
                }
                reject(null)
            } catch(err){reject(err)}
        })
    }
    // add new chat 
    addNewChat(userId: string, newChat: SingleChat){
        return new Promise(async (resolve, reject) => {
            try {
                await this.userModel.updateOne({"_id": userId}, {$push: {chats: newChat}})
                resolve("chat added Succesfly")
            } catch(err) {reject(err)}
        })
    }
    // get user name
    getUserName(usrid: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try{
                const usrname = (await this.userModel.findOne({"_id": usrid}, {name: 1, _id: 0})).name;
                // check for null
                if(!usrname){
                    reject(null)
                    return
                }
                // no err 
                resolve(usrname)
            } catch(err){reject(err)}
        })
    }
    // append new message
    pushNewMessageIntoChat(userId: string, newMessage: ChatMessage, chatId: string){
        return new Promise(async (resolve, reject) => {
            try {
                await this.userModel.updateOne({"_id": userId}, {$push: {"chats.$[elem].chatMessages": newMessage}}, {arrayFilters: [{"elem.chatId": chatId}]})
                resolve("message added Succesfly")
            } catch(err) {reject(err)}
        })
    }
    // get chat's messages
    getChatMessages(cUsrId: string, chatId: string){
        return new Promise(async (resolve, reject) => {
            try {
                const dbres = await this.userModel.findOne({"_id": cUsrId}, {'chats': {$elemMatch: {'chatId': chatId}}}, {projection: {'chats.chatMessages': 1, '_id': 0}})
                resolve(dbres.chats[0].chatMessages)
            } catch(err){reject(err)}
        })
    }
    // set usr onine status
    setUsrOnlineStatus(cUsrId: string, status: string){
        return new Promise(async (resolve, reject) => {
            try {
                await this.userModel.updateOne({_id: cUsrId}, {$set: {onlineStatus: status}})
                resolve("")
            } catch(err){reject(err)}
        })
    }
    // get user onlineStatus
    getUserOnlineStatus(usrId: string): Promise<string>{
        return new Promise(async (resolve, reject) => {
            try {
                const usrOnlineStatus = (await this.userModel.findOne({_id: usrId}, {onlineStatus: 1, _id: 0})).onlineStatus
                // check for null
                if(usrOnlineStatus) {
                    resolve(usrOnlineStatus)
                    return
                }
                reject("error geting usr online status")
            } catch(err){reject(err)}
        })
    }
}
