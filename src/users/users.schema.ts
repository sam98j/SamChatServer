/* eslint-disable no-mixed-spaces-and-tabs */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PushSubscription } from 'web-push';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: false }) password: string;
  @Prop() avatar: string;
  @Prop() socket_id: string | null;
  @Prop({ required: true, unique: true }) usrname: string;
  @Prop() onlineStatus: string;
  @Prop({ required: false, type: Object }) pushNotificationSubscription: PushSubscription | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
