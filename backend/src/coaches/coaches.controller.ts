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
import { CoachesService } from './coaches.service';
import { InPersonSessionsService } from './in-person-sessions.service';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { CreateCoachClientDto } from './dto/create-coach-client.dto';
import { AssignWorkoutDto } from './dto/assign-workout.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('coaches')
@UseGuards(ClerkAuthGuard)
export class CoachesController {
  constructor(
    private readonly coachesService: CoachesService,
    private readonly inPersonSessionsService: InPersonSessionsService,
  ) {}

  // Coach Upgrade
  @Post('upgrade')
  async upgradeToCoach(@Request() req, @Body() createDto: CreateCoachProfileDto) {
    return this.coachesService.upgradeToCoach(req.user.id, createDto);
  }

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

  // Workout Assignments
  @Post('clients/:clientId/workouts')
  async assignWorkout(
    @Request() req,
    @Param('clientId') clientId: string,
    @Body() assignDto: AssignWorkoutDto,
  ) {
    const scheduledFor = assignDto.scheduledFor ? new Date(assignDto.scheduledFor) : undefined;
    const dueDate = assignDto.dueDate ? new Date(assignDto.dueDate) : undefined;
    return this.coachesService.assignWorkout(
      req.user.id,
      clientId,
      assignDto.workoutId,
      scheduledFor,
      dueDate,
      assignDto.notes,
    );
  }

  @Get('clients/:clientId/workouts')
  async getClientWorkouts(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.coachesService.getClientWorkouts(req.user.id, clientId);
  }

  @Get('clients/:clientId/workouts/upcoming')
  async getClientUpcomingWorkouts(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.coachesService.getClientUpcomingWorkouts(req.user.id, clientId);
  }

  @Put('workouts/assignments/:assignmentId/status')
  async updateWorkoutAssignmentStatus(
    @Request() req,
    @Param('assignmentId') assignmentId: string,
    @Body() body: { status: string; clientNotes?: string },
  ) {
    return this.coachesService.updateWorkoutAssignmentStatus(
      assignmentId,
      req.user.id,
      body.status,
      body.clientNotes,
    );
  }

  // In-Person Sessions
  @Post('sessions')
  async scheduleSession(
    @Request() req,
    @Body() body: {
      clientId: string;
      scheduledAt: string;
      workoutId?: string;
      location?: string;
    },
  ) {
    return this.inPersonSessionsService.scheduleSession(
      req.user.id,
      body.clientId,
      new Date(body.scheduledAt),
      body.workoutId,
      body.location,
    );
  }

  @Post('sessions/:id/qr-code')
  async generateQRCode(@Request() req, @Param('id') sessionId: string) {
    return this.inPersonSessionsService.generateQRCode(sessionId, req.user.id);
  }

  @Post('sessions/:id/check-in')
  async checkInWithQR(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() body: { qrCodeId: string },
  ) {
    return this.inPersonSessionsService.checkInWithQR(body.qrCodeId, req.user.id);
  }

  @Post('sessions/:id/start')
  async startSession(@Request() req, @Param('id') sessionId: string) {
    return this.inPersonSessionsService.startSession(sessionId, req.user.id);
  }

  @Post('sessions/:id/complete')
  async completeSession(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() body: { notes?: string; clientFeedback?: string },
  ) {
    return this.inPersonSessionsService.completeSession(
      sessionId,
      req.user.id,
      body.notes,
      body.clientFeedback,
    );
  }

  @Get('sessions')
  async getUpcomingSessions(@Request() req) {
    return this.inPersonSessionsService.getUpcomingSessions(req.user.id);
  }

  @Get('clients/:clientId/sessions')
  async getClientSessions(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.inPersonSessionsService.getClientSessions(req.user.id, clientId);
  }

  // Client Discovery & Invitation
  @Get('search-clients')
  async searchClients(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : undefined;
    return this.coachesService.searchClients(query || '', { limit: limitNum });
  }

  @Post('invitations')
  async sendInvitation(
    @Request() req,
    @Body() body: { clientId: string; message?: string },
  ) {
    return this.coachesService.sendInvitation(req.user.id, body.clientId, body.message);
  }

  @Post('invitations/:coachId/accept')
  async acceptInvitation(
    @Request() req,
    @Param('coachId') coachId: string,
    @Body() body: { inviteCode?: string },
  ) {
    return this.coachesService.acceptInvitation(req.user.id, coachId, body.inviteCode);
  }

  @Post('invitations/:coachId/decline')
  async declineInvitation(
    @Request() req,
    @Param('coachId') coachId: string,
  ) {
    return this.coachesService.declineInvitation(req.user.id, coachId);
  }

  @Get('invitations/pending')
  async getPendingInvitations(@Request() req) {
    return this.coachesService.getPendingInvitations(req.user.id);
  }

  // Client Progress Analytics
  @Get('clients/:clientId/progress')
  async getClientProgress(
    @Request() req,
    @Param('clientId') clientId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const timeframe = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.coachesService.getClientProgress(req.user.id, clientId, timeframe);
  }

  @Get('clients/:clientId/stats')
  async getClientStats(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.coachesService.getClientStats(req.user.id, clientId);
  }

  @Get('clients/:clientId/history')
  async getClientWorkoutHistory(
    @Request() req,
    @Param('clientId') clientId: string,
  ) {
    return this.coachesService.getClientWorkoutHistory(req.user.id, clientId);
  }

  @Get('clients/:clientId/trends')
  async getClientTrends(
    @Request() req,
    @Param('clientId') clientId: string,
    @Query('metric') metric: string = 'sessions',
  ) {
    return this.coachesService.getClientTrends(req.user.id, clientId, metric);
  }
}
