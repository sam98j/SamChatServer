import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer,  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatMessage, MessageStatus, SingleChat } from 'src/users/users.interface';
import {v4 as uuid} from 'uuid'

@WebSocketGateway({cors: true})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private userService: UsersService){}
  // web socket server
  @WebSocketServer() wss: Server;
  // handle send message event
  @SubscribeMessage('send_msg')
  async receiveMessage(@MessageBody() message: Omit<ChatMessage, "readed">, @ConnectedSocket() client: Socket) {
    const chatId = String(client.handshake.query.chatId) as string;
    try {
      // connect to the db to update the socket id
      const {socket_id} = await this.userService.getUserSocketId(message.receiverId);
      // if chatID is not exsist
      if(chatId == "") {
        // create new chat
        const chat = {
          chatId: uuid(),
          chatWith: {},
          chatMessages: [{...message, status: MessageStatus.SENT}],
          lastMessage: {text: message.text, date: message.date},
          unReadedMessages: 0
        } as SingleChat;
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
        await this.userService.addNewChat(message.senderId, {...chat, chatWith: chatWithUsr})
        // add new chat to the other user
        await this.userService.addNewChat(message.receiverId, {...chat, chatWith: currentUsrAsChatWith})
        // emit create chat event
        client.emit("chat_created", chat.chatId)
        // notify sender user about msg sent
        client.emit('message_status', {msgId: message._id, status: MessageStatus.SENT})
        // send to one client
        this.wss.to(socket_id).emit("message", {...message, status: MessageStatus.SENT})
        return
      }
      // if the chat is already exist
      await this.userService.pushNewMessageIntoChat(message.senderId, {...message, status: MessageStatus.SENT}, chatId)
      // notify sender user about msg sent
      client.emit('message_status', {msgId: message._id, status: MessageStatus.SENT})
      await this.userService.pushNewMessageIntoChat(message.receiverId, {...message, status: MessageStatus.SENT}, chatId)
      // send to one client
      this.wss.to(socket_id).emit("message", {...message, status: MessageStatus.SENT})
      // client.emit("message", "test")
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