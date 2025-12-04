import { Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('admin')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Post('seed')
  async seed() {
    return this.prisma.seedDatabase();
  }
}

