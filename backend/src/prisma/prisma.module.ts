import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SeedController } from './seed.controller';

@Global()
@Module({
  providers: [PrismaService],
  controllers: [SeedController],
  exports: [PrismaService],
})
export class PrismaModule {}

