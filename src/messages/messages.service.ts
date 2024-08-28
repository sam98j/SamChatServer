import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './messages.scheam';
import { Model } from 'mongoose';
import { ChatMessage, GetChatMessagesRes, MessageStatus, MessagesTypes } from './messages.interface';
import { FileService } from 'src/services/files';
import { FileToWritenData } from 'src/services/files.interface';

@Injectable()
export class MessagesService {
  private multiChunksMessages = new Map();
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @Inject(FileService) private readonly fileService: FileService,
  ) {}
  // add new message
  async addNewMessage(msg: ChatMessage) {
    try {
      // if it's not a text message then edite those properties
      if (msg.type !== MessagesTypes.TEXT) {
        // destruct needed data
        const { content: bufferStr, sender, receiverId } = msg;
        // data of file to be writen
        const fileData: FileToWritenData = { bufferStr, senderId: sender._id.toString(), receiverId };
        // create file and get it's name
        const createdFileName = await this.fileService.writeFile(fileData);
        // file path
        msg.content = `/${createdFileName}`;
      }
      // insert the file in the database
      await this.messageModel.insertMany([msg]);
      // none text message url content
      const noneTextMsgUrlContent = msg.type === MessagesTypes.TEXT ? '' : msg.content;
      // resolve the promise
      return Promise.resolve(noneTextMsgUrlContent);
    } catch (err) {
      return Promise.reject('db err');
    }
  }
  // update message status
  async updateMessageStatus(msgIDs: string[], status: MessageStatus) {
    try {
      // update messages
      const updateRes = await this.messageModel.updateMany({ _id: { $in: msgIDs } }, { $set: { status } });
      // check if no document was updated
      if (updateRes.modifiedCount === 0) return false;
      // return
      return true;
    } catch (err) {
      return Promise.reject('db error');
    }
  }
  // get chat users messages
  async getChatUsersMessages(chatId: string, pageSize: number, pageNumber: number) {
    try {
      // messages count
      const messagesCount = await this.messageModel.countDocuments({ receiverId: chatId });
      // is it last batch of chat messages
      const isLastBatch = pageSize * pageNumber >= messagesCount;
      // check if batch size is begger than whole collection size
      const batchSize = isLastBatch ? 0 : messagesCount - pageSize * pageNumber;
      // fetch splited messages
      const chatMessages = await this.messageModel.find({ receiverId: chatId }).skip(batchSize);
      // return
      return { chatMessages, isLastBatch } as GetChatMessagesRes;
    } catch (err) {
      return Promise.reject('db error');
    }
  }
  // isItFirstMessage
  async isItFirstMessage(receiverId: string) {
    try {
      const message = await this.messageModel.findOne({ receiverId });
      // if there is a message
      if (message) return false;
      // return
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // add chunk
  addMessageChunk(key: string, value: ChatMessage) {
    // if there is no chunk
    if (!this.messageHasChunk(key)) {
      this.multiChunksMessages.set(key, { msg: value, content: [value.content] });
      return;
    }
    // if there is already chunks
    const oldMessage = this.getMessageChunk(key) as { msg: ChatMessage; content: string[] };
    const newMessage = { msg: oldMessage.msg, content: [...oldMessage.content, value.content] } as {
      msg: ChatMessage;
      content: string[];
    };
    this.multiChunksMessages.set(key, newMessage);
  }
  // getChunk
  getMessageChunk(key: string) {
    return this.multiChunksMessages.get(key);
  }
  // has chunk
  messageHasChunk(key: string) {
    return this.multiChunksMessages.has(key);
  }
  // send message to chat group
  sendMessageToChatGroup() {}
  // send message to indivisual chat
  sendMessageToIndivualChat() {}
}
