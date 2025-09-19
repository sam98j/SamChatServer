import { Types } from 'mongoose';

// Login Successfly Response
export interface LoginSucc {
  _id: string;
  email: string;
  avatar: string;
  name: string;
  socket_id: string | null;
  onlineStatus: string;
}
// current usr profile
export interface LoggedInUsrProfile {
  _id: Types.ObjectId;
  usrname: string;
  email: string;
  avatar: string;
  name: string;
}
// chat profile
export interface ChatUserProfile {
  avatar: string;
  name: string;
  email: string;
}
