import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ChatMessage, MessageStatus } from "./messages.interface";

export type MessageDocument = HydratedDocument<Message>

@Schema()
export class Message implements ChatMessage {
    @Prop({required: true})
    _id: string;
    @Prop({required: true})
    text: string;
    @Prop({required: true})
    senderId: string;
    @Prop()
    status: MessageStatus | null
    @Prop()
    date: string | null
    @Prop()
    receiverId: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)