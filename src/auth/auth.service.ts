import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dtos';

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
          password,
          name,
        },
      });

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
}
