import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { LoginUserDto, RegisterUserDto } from './dtos';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Auth-ms db Mongodb connected');
  }

  async registerUser({ email, name, password }: RegisterUserDto) {
    try {
      const userDb = await this.user.findUnique({
        where: {
          email,
        },
      });

      if (userDb)
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
        });

      const user = await this.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name,
        },
      });
      delete user.password;
      return {
        user,
        token: 'abs',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async loginUser({ email, password }: LoginUserDto) {
    const user = await this.user.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'User/Password not valid',
      });

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword)
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'User/Password not valid',
      });

    delete user.password;
    return {
      user,
      token: 'abs',
    };
  }
}
