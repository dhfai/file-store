/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(nama: string, email: string, password: string) {
    const cekUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (cekUser) {
      throw new HttpException('Email sudah ada', HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);

    const registerUser = await this.prisma.user.create({
      data: {
        name: nama,
        email,
        password: hashPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const response = {
      message: 'Register berhasil',
      data: registerUser,
    };

    return response;
  }

  async login(email: string, password: string) {
    const cekUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!cekUser) {
      throw new HttpException('Email tidak ditemukan', HttpStatus.BAD_REQUEST);
    }

    const passwordMatch = await bcrypt.compare(password, cekUser.password);

    if (!passwordMatch) {
      throw new HttpException('Password salah', HttpStatus.BAD_REQUEST);
    }

    const payload = { id: cekUser.id, email: cekUser.email };

    const token = await this.jwtService.signAsync(payload);

    const response = {
      message: 'Login berhasil',
      token,
      data: cekUser,
    };

    return response;
  }

  async listUser() {
    const users = await this.prisma.user.findMany();

    return users;
  }
}
