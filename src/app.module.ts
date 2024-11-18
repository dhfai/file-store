/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { GoogleDriveController } from './google-drive/google-drive.controller';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [AppController, GoogleDriveController],
  providers: [AppService, GoogleDriveService, PrismaService],
})
export class AppModule {}
