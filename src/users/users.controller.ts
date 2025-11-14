import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}
    
    @UseGuards(AuthTokenGuard)
    @Get()
    async findAll(){
        return this.usersService.findAll();
    }
    
    @Post()
    async create(@Body() createUserDto: CreateUserDto){
        return this.usersService.createUser(createUserDto);
    }
    
}
