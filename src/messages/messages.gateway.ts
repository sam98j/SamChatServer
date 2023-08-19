import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer,  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { SingleChat } from 'src/users/users.interface';
import {v4 as uuid} from 'uuid'
import { ChatMessage, MessageStatus } from './messages.interface';
import { MessagesService } from './messages.service';

@WebSocketGateway({cors: true})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private userService: UsersService, private messageService: MessagesService){}
  // web socket server
  @WebSocketServer() wss: Server;
  // handle send message event
  @SubscribeMessage('send_msg')
  async receiveMessage(@MessageBody() message: Omit<ChatMessage, "readed">, @ConnectedSocket() client: Socket) {
    try {
      // add the message to the db
      await this.messageService.addNewMessage({...message, status: MessageStatus.SENT})
      // connect to the db to update the socket id
      const {socket_id} = await this.userService.getUserSocketId(message.receiverId);
      // send the message to the receiver
      this.wss.to(socket_id).emit("message", {...message, status: MessageStatus.SENT})
      // notify sender user about msg sent
      client.emit('message_status', {msgId: message._id, status: MessageStatus.SENT})
      // check for chat existne
      const isChatExist = await this.userService.checkForChatExist(message.senderId, message.receiverId);
      // if chat is exist then termenate the process
      if(isChatExist) return
      // get current usr name
      const currentUsrName = await this.userService.getUserName(message.senderId)
      // get chatWith usrname
      const chatWithUsrname = await this.userService.getUserName(message.receiverId);
      // chat with current usr
      const currentUsrAsChatWith = {
        usrid: message.senderId,
        usrname: currentUsrName
      }
      // chat with current usr
      const chatWithUsr = {
        usrid: message.receiverId,
        usrname: chatWithUsrname
      }
      // add new chat to the initlizer user
      await this.userService.addNewChat(message.senderId, chatWithUsr)
      // add new chat to the other user
      await this.userService.addNewChat(message.receiverId, currentUsrAsChatWith)
    } catch(err: any){}
    return 'Hello world!';
  }
  // chatusr_start_typing
  @SubscribeMessage("chatusr_typing_status")
  async chatUsrStartTyping(@MessageBody() msg: {chatUsrId: string, status: boolean}){
    try {
      // connect to the db to update the socket id
      const {socket_id} = await this.userService.getUserSocketId(msg.chatUsrId);
      console.log(socket_id)
      // send the chat usr status to the client
      this.wss.to(socket_id).emit('chatusr_typing_status', msg.status)
    } catch(err){}
  }
  // message delevered
  @SubscribeMessage('message_delevered')
  async messageDeleveredHandler(@MessageBody() msg: {msgId: string, senderId: string}){
    try {
      // connect to the db to update the socket id
      const {socket_id} = await this.userService.getUserSocketId(msg.senderId);
      // send to the sender
      this.wss.to(socket_id).emit('message_status', {msgId: msg.msgId, status: MessageStatus.DELEVERED})
      // update message status in db
      await this.messageService.updateMessageStatus(msg.msgId, MessageStatus.DELEVERED)
    } catch(err){}
  }
  // message readed
  @SubscribeMessage('message_readed')
  async messageReadedHandler(@MessageBody() msg: {msgId: string, senderId: string}){
    console.log('message reded', msg.msgId, msg.senderId)
    try {
      // connect to the db to update the socket id
      const {socket_id} = await this.userService.getUserSocketId(msg.senderId);
      // send to the sender
      this.wss.to(socket_id).emit('message_status', {msgId: msg.msgId, status: MessageStatus.READED})
      // update message status
      await this.messageService.updateMessageStatus(msg.msgId, MessageStatus.READED)
    } catch(err){}
  }
  // handle client connection
  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    console.log("client connected")
    try {
      // current connected client id
      const connectedUserId = client.handshake.query.client_id as string;
      // connect to the db to update the socket id
      await this.userService.updateUserSocketId({_id: connectedUserId, socket_id: client.id});
      await this.userService.setUsrOnlineStatus(connectedUserId, "online")
      this.wss.emit("usr_online_status", {id: connectedUserId, status: "online"})
    } catch(err: any){}
  }
  // handle client disconnection
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log("client disconnected")
    try {
      // current connected client id
      const connectedUserId = client.handshake.query.client_id as string;
      // const last seen
      const date = new Date();
      const lastSeen = `last seen ${date.getDate()}-${date.getMonth()} ${date.getHours()}:${date.getMinutes()}`
      await this.userService.setUsrOnlineStatus(connectedUserId, lastSeen)
      this.wss.emit("usr_online_status", {id: connectedUserId, status: lastSeen})
    } catch(err: any){}
  }
}