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
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('me/sessions')
@UseGuards(ClerkAuthGuard)
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
    // Check if user is coach or admin for bypass permissions
    const user = await this.sessionsService.getUser(req.user.id);
    const isCoachOrAdmin = user?.role === 'COACH' || user?.isAdmin === true;
    
    return this.sessionsService.update(id, req.user.id, updateDto, isCoachOrAdmin);
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

