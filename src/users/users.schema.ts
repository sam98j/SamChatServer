/* eslint-disable no-mixed-spaces-and-tabs */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SingleChat } from './users.interface';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() avatar: string;
  @Prop() socket_id: string | null;
  @Prop() chats: SingleChat[];
  @Prop({ required: true, unique: true }) usrname: string;
  @Prop() onlineStatus: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
