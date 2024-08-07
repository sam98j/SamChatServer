/* eslint-disable no-mixed-spaces-and-tabs */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatMessage, ChatUserActions, MessageStatus, MultiChunksMessage } from './messages.interface';
import { MessagesService } from './messages.service';
import { sendNotification, setVapidDetails } from 'web-push';
import { ChatTypes, SingleChat } from 'src/users/users.interface';

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // constructor
  constructor(private userService: UsersService, private messageService: MessagesService) {
    // setup web-push
    const apiKeys = { publicKey: process.env.PUBLIC_VAPID_KEY, privateKey: process.env.PRIVATE_VAPID_KEY };
    setVapidDetails('mailto:hosam98j@gmail.com', apiKeys.publicKey, apiKeys.privateKey);
  }
  // web socket server
  @WebSocketServer() wss: Server;
  // multi chunks message
  @SubscribeMessage('multi_chunks_message')
  async multiChunksMessageHandler(@MessageBody() msg: MultiChunksMessage, @ConnectedSocket() client: Socket) {
    // if it's last chunk
    this.messageService.addMessageChunk(msg.data._id, msg.data);
    // tell the client about message chunk status
    client.emit('chunk_recieved', 'chunk done');
    // terminate if it's not last chunk
    if (!msg.isLastChunk) return;
    // get all file's chunks
    const { content, msg: message } = this.messageService.getMessageChunk(msg.data._id);
    // combine all file's chunks
    const messageContent = content.join('');
    // proccessed chat message
    const chatMessage: ChatMessage = { ...message, content: messageContent, status: MessageStatus.SENT };
    try {
      // notify sender user about msg sent
      client.emit('message_status', { msgId: chatMessage._id, status: MessageStatus.SENT });
      // add the message to the db
      const addChatMessageRes = await this.messageService.addNewMessage(chatMessage);
      // get current chat type
      const currentChatType = await this.userService.getChatType(
        chatMessage.sender._id.toString(),
        chatMessage.receiverId,
      );
      // check for content falsey value
      if (addChatMessageRes) message.content = addChatMessageRes;
      // if chat type is not group
      if (!currentChatType || currentChatType === ChatTypes.INDIVISUAL) {
        console.log(currentChatType);
        const { socket_id, pushNotificationSubscription } = await this.userService.getUserNotificationAdress(
          message.receiverId,
        );
        // send the message to the receiver
        this.wss.to(socket_id).emit('message', { ...message, status: MessageStatus.SENT });
        // get current usr name
        const { avatar: cUserAvatar, name: cUserName } = await this.userService.getUserData(
          chatMessage.sender._id.toString(),
        );
        // send push notification to the message reciver
        if (pushNotificationSubscription) {
          // notification object
          const notificationData = { senderName: cUserName, senderImg: cUserAvatar, msgText: message.content };
          try {
            // send push notification to the receiver
            await sendNotification(pushNotificationSubscription, JSON.stringify(notificationData));
          } catch (error) {
            console.log(error);
          }
        }
        // check for chat existne
        const isChatExist = await this.userService.checkForChatExist(
          chatMessage.sender._id.toString(),
          chatMessage.receiverId,
        );
        // if chat is exist then termenate the process
        if (isChatExist) return;
        // get chatWith usrname
        const { avatar: chatUsrAvatar, name: chatUsrName } = await this.userService.getUserData(
          chatMessage.sender._id.toString(),
        );
        // chat with current usr
        const currentUsrAsChatWith: SingleChat = {
          _id: chatMessage.sender._id.toString(),
          name: cUserName,
          avatar: cUserAvatar,
          type: ChatTypes.INDIVISUAL,
          members: [],
        };
        // chat with current usr
        const chatWithUsr: SingleChat = {
          _id: chatMessage.receiverId,
          name: chatUsrName,
          avatar: chatUsrAvatar,
          type: ChatTypes.INDIVISUAL,
          members: [],
        };
        // add new chat to the initlizer user
        await this.userService.addNewChat(chatMessage.sender._id.toString(), chatWithUsr);
        // add new chat to the other user
        await this.userService.addNewChat(chatMessage.receiverId, currentUsrAsChatWith);
        // send the create chat to the receiver usr
        this.wss.to(socket_id).emit('new_chat_created', currentUsrAsChatWith);
      }
      // if chat type is group
      if (currentChatType === ChatTypes.GROUP) {
        // get group's members sockets IDs
        const socketIDs = await this.userService.getChatMembersSocketIDs(
          chatMessage.sender._id.toString(),
          chatMessage.receiverId,
        );
        // send the message to the receiver
        this.wss.to(socketIDs).emit('message', { ...message, status: MessageStatus.SENT });
      }
    } catch (err) {
      return err;
    }
    return;
  }
  // chatusr_start_typing
  @SubscribeMessage('chatusr_typing_status')
  async chatUsrStartTyping(@MessageBody() msg: { chatUsrId: string; action: ChatUserActions; cUsrId: string }) {
    try {
      // connect to the db to update the socket id
      const { socket_id } = await this.userService.getUserNotificationAdress(msg.chatUsrId);
      // send the chat usr status to the client
      this.wss.to(socket_id).emit('chatusr_typing_status', {
        action: msg.action,
        actionSender: msg.cUsrId,
      });
    } catch (err) {
      return err;
    }
  }
  // message delevered
  @SubscribeMessage('message_delevered')
  async messageDeleveredHandler(@MessageBody() msg: { msgId: string; senderId: string }) {
    console.log('message delevered');
    try {
      // connect to the db to update the socket id
      const { socket_id } = await this.userService.getUserNotificationAdress(msg.senderId);
      // send to the sender
      this.wss.to(socket_id).emit('message_status', {
        msgId: msg.msgId,
        status: MessageStatus.DELEVERED,
      });
      // update message status in db
      await this.messageService.updateMessageStatus(msg.msgId, MessageStatus.DELEVERED);
    } catch (err) {
      return err;
    }
  }
  // message readed
  @SubscribeMessage('message_readed')
  async messageReadedHandler(@MessageBody() msg: { msgId: string; senderId: string }) {
    console.log('message readed');
    try {
      // connect to the db to update the socket id
      const { socket_id } = await this.userService.getUserNotificationAdress(msg.senderId);
      // send to the sender
      this.wss.to(socket_id).emit('message_status', {
        msgId: msg.msgId,
        status: MessageStatus.READED,
      });
      // update message status
      await this.messageService.updateMessageStatus(msg.msgId, MessageStatus.READED);
    } catch (err) {
      return err;
    }
  }
  // handle client connection
  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('client connected');
    try {
      // current connected client id
      const connectedUserId = client.handshake.query.client_id as string;
      // connect to the db to update the socket id
      await this.userService.updateUserSocketId({
        _id: connectedUserId,
        socket_id: client.id,
      });
      await this.userService.setUsrOnlineStatus(connectedUserId, 'online');
      this.wss.emit('usr_online_status', {
        id: connectedUserId,
        status: 'online',
      });
    } catch (err) {
      return err;
    }
  }
  // handle client disconnection
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('client disconnected');
    try {
      // current connected client id
      const connectedUserId = client.handshake.query.client_id as string;
      // const last seen
      const date = new Date();
      const lastSeen = date.toString();
      await this.userService.setUsrOnlineStatus(connectedUserId, lastSeen);
      this.wss.emit('usr_online_status', {
        id: connectedUserId,
        status: lastSeen,
      });
    } catch (err) {
      return err;
    }
  }
}
