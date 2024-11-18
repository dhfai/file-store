/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
