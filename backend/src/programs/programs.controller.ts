import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Get()
  async findAll() {
    return this.programsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.programsService.findBySlug(slug);
  }

  @Post()
  async create(@Body() createProgramDto: any) {
    return this.programsService.create(createProgramDto);
  }

  @Post('create-with-workouts')
  @UseGuards(ClerkAuthGuard)
  async createWithWorkouts(@Request() req, @Body() data: any) {
    return this.programsService.createWithWorkouts({
      ...data,
      createdBy: req.user.id,
    });
  }
}

