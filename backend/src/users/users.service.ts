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
    // This is used internally for auth, so we need passwordHash
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    
    if (!user) return null;
    
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as typeof userWithoutPassword & { isAdmin: boolean };
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

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    
    // Remove passwordHash from all users
    return users.map(({ passwordHash, ...user }) => user);
  }

  async setAdmin(userId: string, isAdmin: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateRole(userId: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateSubscription(userId: string, tier: string, subscriptionEnds?: Date) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier as any,
        subscriptionEnds,
      },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

