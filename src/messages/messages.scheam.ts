/* eslint-disable no-mixed-spaces-and-tabs */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';
import { ActionMessagesTypes, ChatMessage, MessageStatus, MessagesTypes } from './messages.interface';
import { ChatMember } from 'src/chats/chats.interfaces';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message implements ChatMessage {
  @Prop({ required: true }) _id: string;
  @Prop({ required: true }) content: string;
  @Prop({ required: true, type: Object }) sender: ChatMember;
  @Prop() status: MessageStatus | null;
  @Prop() fileSize: MessageStatus | null;
  @Prop() fileName: MessageStatus | null;
  @Prop() forwardedTo?: string[];
  @Prop({ type: Date }) date: Date | null;
  @Prop() receiverId: string;
  @Prop() isForwarded?: boolean;
  @Prop() actionMsgType?: ActionMessagesTypes;
  @Prop() type: MessagesTypes;
  @Prop() replyTo: string | null;
  @Prop({ type: Object }) msgReplyedTo: Pick<ChatMessage, '_id' | 'content' | 'type' | 'sender'> | null;
  @Prop() voiceNoteDuration: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
