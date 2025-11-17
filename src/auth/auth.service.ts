import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwtConfig from './config/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private readonly hashingService: HashingServiceProtocol,
        
        @Inject(jwtConfig.KEY) 
        private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService,
    ) {}

    async authenticate(
        loginDto: LoginDto,
        res: Response
    ){
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new HttpException('Credenciais inválidas.', HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await this.hashingService.compare(
            loginDto.password,
            user.password
        );
        
        if (!isPasswordValid) {
            throw new HttpException('Credenciais inválidas.', HttpStatus.UNAUTHORIZED);
        }

        const token = await this.jwtService.signAsync(
            {  
                id: user.id,
                email: user.email,
                role: user.role 
            },
            {
                secret: this.jwtConfiguration.secret,
                expiresIn: '1d',
            }
        );
        
        return { 
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        };
    }
}
