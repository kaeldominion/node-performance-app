import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserProgramsService } from './user-programs.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('me/programs')
@UseGuards(ClerkAuthGuard)
export class UserProgramsController {
  constructor(private userProgramsService: UserProgramsService) {}

  @Post()
  async startProgram(
    @Request() req,
    @Body() body: { programId: string; startDate: string },
  ) {
    return this.userProgramsService.startProgram(
      req.user.id,
      body.programId,
      new Date(body.startDate),
    );
  }

  @Get('active')
  async getActiveProgram(@Request() req) {
    return this.userProgramsService.getActiveProgram(req.user.id);
  }

  @Get('schedule')
  async getSchedule(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userProgramsService.getSchedule(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}

