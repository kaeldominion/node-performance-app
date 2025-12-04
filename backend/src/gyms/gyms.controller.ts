import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymProfileDto } from './dto/create-gym-profile.dto';
import { CreateGymClassDto } from './dto/create-gym-class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gyms')
@UseGuards(JwtAuthGuard)
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  // Gym Profile
  @Post('profile')
  async createProfile(@Request() req, @Body() createDto: CreateGymProfileDto) {
    return this.gymsService.createProfile(req.user.id, createDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.gymsService.getProfile(req.user.id);
  }

  @Get('profile/:userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.gymsService.getProfile(userId);
  }

  // Members
  @Post('members')
  async addMember(@Body() body: { gymId: string; userId: string }) {
    return this.gymsService.addMember(body.gymId, body.userId);
  }

  @Get(':gymId/members')
  async getMembers(@Param('gymId') gymId: string) {
    return this.gymsService.getMembers(gymId);
  }

  @Delete(':gymId/members/:userId')
  async removeMember(@Param('gymId') gymId: string, @Param('userId') userId: string) {
    return this.gymsService.removeMember(gymId, userId);
  }

  // Classes
  @Post(':gymId/classes')
  async createClass(@Param('gymId') gymId: string, @Body() createDto: CreateGymClassDto) {
    return this.gymsService.createClass(gymId, createDto);
  }

  @Get(':gymId/classes')
  async getClasses(
    @Param('gymId') gymId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.gymsService.getClasses(
      gymId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('classes/:classId')
  async getClass(@Param('classId') classId: string) {
    return this.gymsService.getClass(classId);
  }

  @Patch('classes/:classId')
  async updateClass(@Param('classId') classId: string, @Body() updateDto: Partial<CreateGymClassDto>) {
    return this.gymsService.updateClass(classId, updateDto);
  }

  @Delete('classes/:classId')
  async deleteClass(@Param('classId') classId: string) {
    return this.gymsService.deleteClass(classId);
  }

  // Attendance
  @Post('classes/:classId/attend')
  async registerAttendance(@Param('classId') classId: string, @Request() req) {
    return this.gymsService.registerAttendance(classId, req.user.id);
  }

  @Post('classes/:classId/attend/:sessionLogId')
  async markAttendanceWithSession(
    @Param('classId') classId: string,
    @Param('sessionLogId') sessionLogId: string,
    @Request() req,
  ) {
    return this.gymsService.markAttendanceWithSession(classId, req.user.id, sessionLogId);
  }
}
