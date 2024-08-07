import { Types } from 'mongoose';
import { UserDocument } from './users.schema';
import { IsNotEmpty } from 'class-validator';

// Login Successfly Response
export interface LoginSucc {
  _id: string;
  email: string;
  avatar: string;
  name: string;
  socket_id: string | null;
  onlineStatus: string;
}
// Chat's Types
export enum ChatTypes {
  'INDIVISUAL' = 'INDIVISUAL',
  'GROUP' = 'GROUP',
}
// Chat's Member
export type ChatMember = Pick<UserDocument, '_id' | 'avatar' | 'name'>;
// Chat
export interface SingleChat {
  _id: string;
  name: string;
  avatar: string;
  type: ChatTypes;
  members: ChatMember[];
}
// chat profile
export interface ChatProfile {
  avatar: string;
  name: string;
  email: string;
}
// current usr profile
export interface LoggedInUsrProfile {
  _id: Types.ObjectId;
  usrname: string;
  email: string;
  avatar: string;
  name: string;
}
// create chat group dto
export class CreateGroupChatDTO {
  @IsNotEmpty() members: ChatMember[];
  @IsNotEmpty() name: string;
}
