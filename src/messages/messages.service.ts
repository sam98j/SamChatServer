import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './messages.scheam';
import { Model } from 'mongoose';
import { ChatMessage, MessageStatus } from './messages.interface';

@Injectable()
export class MessagesService {
	constructor(@InjectModel(Message.name) private messageModel: Model<Message>){}
	// add new message
	async addNewMessage(msg: ChatMessage){
		try {
			await this.messageModel.insertMany([msg]);
			return('message added');
		} catch(err){return(err);}
	}
	// update message status
	async updateMessageStatus(msgId: string, status: MessageStatus){
		try {
			await this.messageModel.updateOne({_id: msgId}, {$set: {status}});
			return('message status updated');
		} catch(err){return(err);}
	}
	// get chat users messages
	// update message status
	async getChatUsersMessages(fUserId: string, sUserId: string): Promise<ChatMessage[]>{
		try {
			const messages = await this.messageModel.find({$and: [{$or: [{senderId: fUserId}, {senderId: sUserId}]}, {$or: [{receiverId: fUserId}, {receiverId: sUserId}]}]});
			return(messages);
		} catch(err){return(err);}
	}
}
