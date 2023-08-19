import { RegisterDTO } from "src/auth/auth.interface";
import { ChatMessage } from "src/messages/messages.interface";

// Login Successfly Response
export interface LoginSucc {
    _id: string,
    email: string,
    avatar: string,
    name: string,
    socket_id: string | null
    onlineStatus: string
}

export interface SingleChat {
    usrid: string, 
    usrname: string
}