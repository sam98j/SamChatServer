import { RegisterDTO } from "src/auth/auth.interface";

// Login Successfly Response
export interface LoginSucc {
    _id: string,
    email: string,
    avatar: string,
    name: string,
    socket_id: string | null
    onlineStatus: string
}

// message status enum
export enum MessageStatus {
    'SENT' = "SENT",
    'DELEVERED' = 'DELEVERED',
    'READED' = "READED"
}
// chat Message interface
export interface ChatMessage {
    _id: string;
    text: string;
    senderId: string;
    receiverId: string;
    status: MessageStatus | null;
    date: string;
}

export interface SingleChat {
    chatId: string;
    chatWith: {usrid: string, usrname: string};
    lastMessage: {
        date: string;
        text: string
    };
    unReadedMessages: number;
    chatMessages: ChatMessage[]
}