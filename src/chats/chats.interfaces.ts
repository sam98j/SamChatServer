import { UserDocument } from 'src/users/users.schema';

// getMembersNotificationAdress
export type getChatMembersRes = {
  members: UserDocument[];
}[];
// Chat's Types
export enum ChatTypes {
  'INDIVISUAL' = 'INDIVISUAL',
  'GROUP' = 'GROUP',
}
// Chat's Member
export type ChatMember = Pick<UserDocument, '_id' | 'avatar' | 'name'>;
// Chat
export interface SingleChat {
  _id?: string;
  name: string;
  avatar: string;
  type: ChatTypes;
  members: ChatMember[];
}
