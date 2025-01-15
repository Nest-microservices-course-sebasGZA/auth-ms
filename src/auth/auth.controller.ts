import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser() {
    return 'register user';
  }

  @MessagePattern('auth.register.user')
  loginUser() {
    return 'login user';
  }

  @MessagePattern('auth.register.user')
  verifyToken() {
    return 'verify token ';
  }
}
