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

export interface SingleChat {
  usrid: string;
  usrname: string;
  avatar: string;
}
// chat profile
export interface ChatProfile {
  avatar: string;
  name: string;
  email: string;
}
// current usr profile
export interface LoggedInUsrProfile {
  _id: Types.ObjectId;
  usrname: string;
  email: string;
  avatar: string;
  name: string;
}
