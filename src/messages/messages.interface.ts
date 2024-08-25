import { ChatMember } from 'src/chats/chats.interfaces';

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
