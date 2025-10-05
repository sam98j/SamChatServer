import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './chats.schema';
import { Model, PipelineStage } from 'mongoose';
import { ChatMember, SingleChat } from './chats.interfaces';
import { MessageStatus } from 'src/messages/messages.interface';
import { getChatMembersRes } from './chats.interfaces';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatsModel: Model<Chat>) {}
  // add new chat
  async addNewChat(newChat: SingleChat) {
    try {
      // add new chat
      await this.chatsModel.insertMany([newChat]);
      // return
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // getChat
  async getChat(chatId: string) {
    try {
      const chat = await this.chatsModel.findOne({ _id: chatId });
      // if no chat
      if (!chat) return null;
      // return
      return chat;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // get users chats
  async getUserChats(usrId: string) {
    // TODO: enhance this query
    const query = [
      { $match: { 'members._id': usrId } },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id', chatMembers: '$members' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $eq: ['$receiverId', '$$chatId'],
                    },
                    {
                      $and: [{ $isArray: '$forwardedTo' }, { $in: ['$$chatId', '$forwardedTo'] }],
                    },
                  ],
                },
              },
            },
            { $sort: { date: -1 } },
            {
              $group: {
                _id: '$$chatId',
                lastMessage: { $first: '$$ROOT' },
                unReaded: {
                  $sum: {
                    $cond: [
                      {
                        $and: [{ $eq: ['$status', MessageStatus.DELEVERED] }, { $ne: ['$sender._id', usrId] }],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: 'data',
        },
      },
      { $unwind: { path: '$data', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: 1,
          members: 1,
          name: 1,
          avatar: 1,
          lastMessage: '$data.lastMessage',
          unReadedMsgs: '$data.unReaded',
        },
      },
    ] as PipelineStage[];

    //
    try {
      // get usr chats
      const chats = await this.chatsModel.aggregate(query);
      // return
      return chats;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // getChatMembersNotificationAdress
  async getChatMembersNotificationAdress(loggedInUsr: string, chatId: string) {
    try {
      // db query
      const query = [
        { $match: { _id: chatId } },
        {
          $lookup: {
            from: 'users',
            localField: 'members.name',
            foreignField: 'name',
            as: 'data',
          },
        },
        {
          $project: {
            members: {
              $map: {
                input: '$data',
                as: 'member',
                in: '$$member',
              },
            },
          },
        },
      ] as PipelineStage[];
      // get chat
      const getChatMembersRes = (await this.chatsModel.aggregate(query)) as getChatMembersRes;
      // if three is no chat
      if (!getChatMembersRes) return null;
      // retur chat members id and exclude current user
      const chatMembersNotificationAdress = getChatMembersRes[0].members
        .filter((member) => member.name !== loggedInUsr)
        .map((member) => ({
          socket_id: member.socket_id,
          pushNotificationSubscription: member.pushNotificationSubscription,
        }));
      // return
      return chatMembersNotificationAdress;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  // delete chat
  async deleteChat(_id: string) {
    try {
      const deleteChatRes = await this.chatsModel.deleteOne({ _id });
      // if no document was deleted
      if (!deleteChatRes.deletedCount) throw new Error('No chat was deleted');
      // return
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // add chat members
  async addChatMembers(_id: string, members: ChatMember[]) {
    try {
      const addMembersRes = await this.chatsModel.updateOne({ _id }, { $push: { members: { $each: members } } });
      // if no document was deleted
      if (!addMembersRes.modifiedCount) throw new Error('No member was added');
      // return
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
