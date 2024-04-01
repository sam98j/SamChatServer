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
        const { content: bufferStr, senderId, receiverId } = msg;
        // data of file to be writen
        const fileData: FileToWritenData = { bufferStr, senderId, receiverId };
        // create file and get it's name
        const createdFileName = await this.fileService.writeFile(fileData);
        // file path
        msg.content = `/${createdFileName}`;
      }
      // insert the file in the database
      await this.messageModel.insertMany([msg]);
      return Promise.resolve('message added');
    } catch (err) {
      return Promise.reject('db err');
    }
  }
  // update message status
  async updateMessageStatus(msgId: string, status: MessageStatus) {
    try {
      await this.messageModel.updateOne({ _id: msgId }, { $set: { status } });
      return Promise.resolve('message status updated');
    } catch (err) {
      return Promise.reject('db error');
    }
  }
  // get chat users messages
  async getChatUsersMessages(
    fUserId: string,
    sUserId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<GetChatMessagesRes> {
    try {
      // get messages query
      const getMessagesQuery = {
        $and: [
          { $or: [{ senderId: fUserId }, { senderId: sUserId }] },
          { $or: [{ receiverId: fUserId }, { receiverId: sUserId }] },
        ],
      };
      // messages count
      const messagesCount = await this.messageModel.countDocuments(getMessagesQuery);
      // is it last batch of chat messages
      const isLastBatch = pageSize * pageNumber >= messagesCount;
      // check if batch size is begger than whole collection size
      const batchSize = isLastBatch ? 0 : messagesCount - pageSize * pageNumber;
      // fetch splited messages
      const chatMessages = await this.messageModel.find(getMessagesQuery).skip(batchSize);
      // return
      return Promise.resolve({ chatMessages, isLastBatch });
    } catch (err) {
      return Promise.reject('db error');
    }
  }
  // add chunk
  addChunk(key: string, value: ChatMessage) {
    // if there is no chunk
    if (!this.hasChunk(key)) {
      this.multiChunksMessages.set(key, { msg: value, content: [value.content] });
      return;
    }
    // if there is already chunks
    const oldMessage = this.getChunk(key) as { msg: ChatMessage; content: string[] };
    const newMessage = { msg: oldMessage.msg, content: [...oldMessage.content, value.content] } as {
      msg: ChatMessage;
      content: string[];
    };
    this.multiChunksMessages.set(key, newMessage);
  }
  // getChunk
  getChunk(key: string) {
    return this.multiChunksMessages.get(key);
  }
  // has chunk
  hasChunk(key: string) {
    return this.multiChunksMessages.has(key);
  }
}
