import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './messages.scheam';
import { Model } from 'mongoose';
import { ChatMessage, MessageStatus } from './messages.interface';

@Injectable()
export class MessagesService {
    constructor(@InjectModel(Message.name) private messageModel: Model<Message>){}
    // add new message
    addNewMessage(msg: ChatMessage){
        return new Promise(async (resolve, reject) => {
            try {
                 await this.messageModel.insertMany([msg])
                 resolve("message added")
            } catch(err){reject(err)}
        })
    }
    // update message status
    updateMessageStatus(msgId: string, status: MessageStatus){
        return new Promise(async (resolve, reject) => {
            try {
                 await this.messageModel.updateOne({_id: msgId}, {$set: {status}})
                 resolve("message status updated")
            } catch(err){reject(err)}
        })
    }
    // get chat users messages
    // update message status
    getChatUsersMessages(fUserId: string, sUserId: string): Promise<ChatMessage[]>{
        return new Promise(async (resolve, reject) => {
            try {
                 const messages = await this.messageModel.find({$and: [{$or: [{senderId: fUserId}, {senderId: sUserId}]}, {$or: [{receiverId: fUserId}, {receiverId: sUserId}]}]})
                 resolve(messages)
            } catch(err){reject(err)}
        })
    }
}
