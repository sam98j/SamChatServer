import { Date } from 'mongoose';
import { ChatMember } from 'src/chats/chats.interfaces';

// message status enum
export enum MessageStatus {
  'SENT' = 'SENT',
  'DELEVERED' = 'DELEVERED',
  'READED' = 'READED',
}
// chat user actions
export enum ChatActionsTypes {
  'TYPEING' = 'TYPEING',
  'RECORDING_VOICE' = 'RECORDING_VOICE',
}
// chat Action
export interface ChatActions {
  type: ChatActionsTypes | null;
  senderId: string;
  chatId: string;
  chatMembers: string[];
}
// message types
export enum MessagesTypes {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  PHOTO = 'PHOTO',
  FILE = 'FILE',
  ACTION = 'ACTION',
  VOICENOTE = 'VOICENOTE',
}
// chat Actions
export type ActionMessagesTypes = 'CREATION' | 'MEMBER_ADITION';
// forward message
export interface ForwardMessagesDTO {
  chats: string[];
  messages: string[];
}
// chat Message interface
export interface ChatMessage {
  _id: string;
  content: string;
  type: MessagesTypes;
  actionMsgType?: ActionMessagesTypes;
  fileName: string | null;
  fileSize: string | null;
  sender: ChatMember;
  forwardedTo?: string[];
  receiverId: string;
  status: MessageStatus | null;
  date: Date;
  replyTo: string | null;
  msgReplyedTo: Pick<ChatMessage, '_id' | 'content' | 'type'> | null;
  voiceNoteDuration: string;
}
// multi chunks message
export interface MultiChunksMessage {
  data: ChatMessage;
  isLastChunk: boolean;
}
// get chat messages response
export interface GetChatMessagesRes {
  chatMessages: ChatMessage[];
  isLastBatch: boolean;
}
// ChangeMessage'Status
export interface ChangeMessageStatusDTO {
  msgIDs: string[];
  msgStatus: MessageStatus;
  chatId: string;
  senderIDs?: string[];
}
