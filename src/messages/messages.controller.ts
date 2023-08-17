import { Controller, Get, HttpException, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

@Controller('messages')
export class MessagesController {
    constructor(private userService: UsersService){}
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
                }
            }
            return null
        } catch(err: any){}
    }
    // chat's message with specific usr
    @UseGuards(AuthGuard('jwt'))
    @Get("/getchatmessages/:chatId")
    async chatMessagesHandler(@Request() req, @Param("chatId") chatId: string){
        try{
            const res = await this.userService.getChatMessages(req.user.userId, chatId);
            return res
        } catch(err){return new HttpException("Internal Server err", HttpStatus.INTERNAL_SERVER_ERROR)}
    }
}