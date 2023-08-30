// message status enum
export enum MessageStatus {
    'SENT' = 'SENT',
    'DELEVERED' = 'DELEVERED',
    'READED' = 'READED'
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