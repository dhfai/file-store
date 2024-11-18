/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body('nama') nama: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(nama, email, password);
  }

  @Post('login')
  login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password);
  }

  // @Get('ListUser')
  // ListUser() {
  //   return this.authService.listUser();
  // }
}
