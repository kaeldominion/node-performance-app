import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, updateDto: UpdateUserProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: updateDto,
      create: {
        userId,
        ...updateDto,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }
}

