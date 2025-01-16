import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginUserDto, RegisterUserDto } from './dtos';
import { IJwtPayload } from './interfaces/jwt.interfacce';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Auth-ms db Mongodb connected');
  }

  signJwt(payload: IJwtPayload) {
    return this.jwtService.sign(payload);
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
        token: this.signJwt(user),
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
      token: this.signJwt(user),
    };
  }

  verifyToken(token: string) {
    try {
      const { email, id, name } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      const user = { email, id, name };
      return {
        user,
        token: this.signJwt(user),
      };
    } catch {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token not valid',
      });
    }
  }
}
