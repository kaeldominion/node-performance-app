import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // Public endpoints
  @Get()
  async findAll(
    @Query('public') includePublic?: string,
    @Query('archetype') archetype?: string,
  ) {
    if (archetype) {
      return this.templatesService.findByArchetype(archetype);
    }
    return this.templatesService.findAll(includePublic !== 'false');
  }

  @Get('system')
  async getSystemTemplates() {
    return this.templatesService.getSystemTemplates();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  // Protected endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createDto: CreateTemplateDto) {
    return this.templatesService.create(req.user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: Partial<CreateTemplateDto>,
  ) {
    return this.templatesService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return this.templatesService.delete(id, req.user.id);
  }
}
