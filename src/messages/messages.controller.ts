/* eslint-disable no-mixed-spaces-and-tabs */
import { Controller, Get, HttpException, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from './messages.service';
import { MessageStatus } from './messages.interface';

@Controller('messages')
export class MessagesController {
	constructor(private userService: UsersService, private messageService: MessagesService){}
    // profile route
    @UseGuards(AuthGuard('jwt'))
    @Get('chats')
	async profileHandler(@Request() req){
		try {
			const userChats = await this.userService.getUserChats(req.user.userId as string);
			// check for null
			if (userChats){
				return {
					chats: userChats,
					userId: req.user.userId
				};
			}
			return null;
		} catch(err){return err;}
	}
    // chat's message with specific usr
    @UseGuards(AuthGuard('jwt'))
    @Get('/getchatmessages/:chaUsrtId')
    async chatMessagesHandler(@Request() req, @Param('chaUsrtId') chaUsrtId: string){
    	try{
    		const res = await this.messageService.getChatUsersMessages(req.user.userId, chaUsrtId);
    		return res;
    	} catch(err){return new HttpException('Internal Server err', HttpStatus.INTERNAL_SERVER_ERROR);}
    }
    // get chat preveiew data
    @UseGuards(AuthGuard('jwt'))
    @Get('/getchatpreviewdata/:chatUsrId')
    async chatPreviewData(@Request() req, @Param('chatUsrId') chatUsrId: string){
    	try {
    		// get chat messages
    		const chatMessages = await (await this.messageService.getChatUsersMessages(req.user.userId, chatUsrId));
    		// get unReaded Messages
    		const unReadedMsgs = chatMessages.filter(msg => msg.receiverId === req.user.userId && msg.status === MessageStatus.DELEVERED).length;
    		// chat last message
    		const {text, date, isItTextMsg, voiceNoteDuration, senderId, status} = chatMessages[chatMessages.length -1 ];
    		// last msg date
    		const lastMsgDate = new Date(date);
    		// return data
    		return {
    			isItTextMsg,
    			lastMsgText: isItTextMsg ? text : '',
    			unReadedMsgs,
    			voiceNoteDuration,
    			senderId,
    			status,
    			date: `${lastMsgDate.getHours()}:${lastMsgDate.getMinutes()}`
    		};
    	} catch (error) {return new HttpException('Server Err', HttpStatus.INTERNAL_SERVER_ERROR);}
    }
}