import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { CreateCoachClientDto } from './dto/create-coach-client.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('coaches')
@UseGuards(ClerkAuthGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  // Coach Profile
  @Post('profile')
  async createProfile(@Request() req, @Body() createDto: CreateCoachProfileDto) {
    return this.coachesService.createProfile(req.user.id, createDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.coachesService.getProfile(req.user.id);
  }

  @Get('profile/:userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.coachesService.getProfile(userId);
  }

  // Client Management
  @Post('clients')
  async addClient(@Request() req, @Body() createDto: CreateCoachClientDto) {
    return this.coachesService.addClient(req.user.id, createDto);
  }

  @Get('clients')
  async getClients(@Request() req) {
    return this.coachesService.getClients(req.user.id);
  }

  @Delete('clients/:clientId')
  async removeClient(@Request() req, @Param('clientId') clientId: string) {
    return this.coachesService.removeClient(req.user.id, clientId);
  }

  // Program Assignments
  @Post('clients/:clientId/programs/:programId')
  async assignProgram(
    @Request() req,
    @Param('clientId') clientId: string,
    @Param('programId') programId: string,
    @Body() body: { startDate?: string },
  ) {
    const startDate = body.startDate ? new Date(body.startDate) : undefined;
    return this.coachesService.assignProgram(req.user.id, clientId, programId, startDate);
  }

  @Get('clients/:clientId/assignments')
  async getClientAssignments(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.coachesService.getClientAssignments(req.user.id, clientId);
  }
}
