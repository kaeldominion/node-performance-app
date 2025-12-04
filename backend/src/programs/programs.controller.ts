import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProgramsService } from './programs.service';

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
}

