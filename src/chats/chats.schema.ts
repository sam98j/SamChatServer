/* eslint-disable no-mixed-spaces-and-tabs */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatMember, ChatTypes, SingleChat } from './chats.interfaces';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat implements SingleChat {
  @Prop({ required: true }) _id: string;
  @Prop() avatar: string;
  @Prop() name: string;
  @Prop() type: ChatTypes;
  @Prop({ type: Object }) members: ChatMember[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
