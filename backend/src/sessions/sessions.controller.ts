import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('me/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  async create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, createSessionDto);
  }

  @Put(':id/complete')
  async complete(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, req.user.id, updateDto);
  }

  @Get('recent')
  async findRecent(@Request() req, @Query('limit') limit?: string) {
    return this.sessionsService.findRecent(
      req.user.id,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':workoutId')
  async findByWorkout(
    @Request() req,
    @Param('workoutId') workoutId: string,
  ) {
    return this.sessionsService.findByWorkout(req.user.id, workoutId);
  }
}

