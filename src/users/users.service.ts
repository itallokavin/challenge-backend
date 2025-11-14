import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol
    ) {}

    async findAll() {
        const allUsers = await this.prisma.user.findMany();
        return allUsers;
    }

    async createUser(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        
        if (existingUser) {
            throw new HttpException('Email já cadastrado.', HttpStatus.CONFLICT);
        }

        const hashedPassword = await this.hashingService.hash(createUserDto.password);
        
        const newUser = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        return newUser;
    }
}
