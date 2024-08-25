/* eslint-disable no-mixed-spaces-and-tabs */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatMessage, MessageStatus, MessagesTypes } from './messages.interface';
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
  @Prop() date: string | null;
  @Prop() receiverId: string;
  @Prop() type: MessagesTypes;
  @Prop() voiceNoteDuration: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
