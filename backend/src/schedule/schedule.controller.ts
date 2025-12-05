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
import { ScheduleService } from './schedule.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('me/schedule')
@UseGuards(ClerkAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  async createScheduledWorkout(
    @Request() req: any,
    @Body() body: {
      workoutId?: string;
      programId?: string;
      scheduledDate: string;
      duration?: number;
      notes?: string;
    },
  ) {
    return this.scheduleService.createScheduledWorkout(req.user.id, {
      workoutId: body.workoutId,
      programId: body.programId,
      scheduledDate: new Date(body.scheduledDate),
      duration: body.duration,
      notes: body.notes,
    });
  }

  @Post('program')
  async scheduleProgram(
    @Request() req: any,
    @Body() body: {
      programId: string;
      startDate: string;
      startTime?: string;
    },
  ) {
    return this.scheduleService.scheduleProgram(
      req.user.id,
      body.programId,
      new Date(body.startDate),
      body.startTime,
    );
  }

  @Get()
  async getSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.scheduleService.getSchedule(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Put(':id')
  async updateScheduledWorkout(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {
      scheduledDate?: string;
      duration?: number;
      notes?: string;
      order?: number;
    },
  ) {
    return this.scheduleService.updateScheduledWorkout(req.user.id, id, {
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
      duration: body.duration,
      notes: body.notes,
      order: body.order,
    });
  }

  @Delete(':id')
  async deleteScheduledWorkout(@Request() req: any, @Param('id') id: string) {
    return this.scheduleService.deleteScheduledWorkout(req.user.id, id);
  }

  @Post('reorder')
  async reorderScheduledWorkouts(
    @Request() req: any,
    @Body() body: {
      updates: Array<{ id: string; scheduledDate: string; order: number }>;
    },
  ) {
    return this.scheduleService.reorderScheduledWorkouts(
      req.user.id,
      body.updates.map((u) => ({
        id: u.id,
        scheduledDate: new Date(u.scheduledDate),
        order: u.order,
      })),
    );
  }
}

