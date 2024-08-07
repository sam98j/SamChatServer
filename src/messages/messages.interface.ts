import { ChatMember } from 'src/users/users.interface';

// message status enum
export enum MessageStatus {
  'SENT' = 'SENT',
  'DELEVERED' = 'DELEVERED',
  'READED' = 'READED',
}
// chat user actions
export enum ChatUserActions {
  'TYPEING' = 'TYPEING',
  'RECORDING_VOICE' = 'RECORDING_VOICE',
}
// message types
export enum MessagesTypes {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  PHOTO = 'PHOTO',
  FILE = 'FILE',
  VOICENOTE = 'VOICENOTE',
}
// chat Message interface
export interface ChatMessage {
  _id: string;
  content: string;
  type: MessagesTypes;
  fileName: string | null;
  fileSize: string | null;
  sender: ChatMember;
  receiverId: string;
  status: MessageStatus | null;
  date: string;
  voiceNoteDuration: string;
}
// chat preview data
export interface ChatPreviewData {
  date: string;
  lastMsgText: string;
  unReadedMsgs: number;
  type: MessagesTypes;
  fileName: null | string;
  voiceNoteDuration: string;
  senderId: string;
  status: MessageStatus;
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
