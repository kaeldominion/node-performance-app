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
  async addMember(@Request() req, @Body() body: { memberId: string; membershipType?: string; status?: string }) {
    const profile = await this.gymsService.getProfile(req.user.id);
    return this.gymsService.addMember(profile.id, body.memberId, body.membershipType, body.status);
  }

  @Get('members')
  async getMembers(@Request() req) {
    const profile = await this.gymsService.getProfile(req.user.id);
    return this.gymsService.getMembers(profile.id);
  }

  @Delete('members/:memberId')
  async removeMember(@Request() req, @Param('memberId') memberId: string) {
    const profile = await this.gymsService.getProfile(req.user.id);
    return this.gymsService.removeMember(profile.id, memberId);
  }

  // Classes
  @Post('classes')
  async createClass(@Request() req, @Body() createDto: CreateGymClassDto) {
    const profile = await this.gymsService.getProfile(req.user.id);
    return this.gymsService.createClass(profile.id, createDto);
  }

  @Get('classes')
  async getClasses(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const profile = await this.gymsService.getProfile(req.user.id);
    return this.gymsService.getClasses(
      profile.id,
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
  @Get('classes/:classId/attendance')
  async getClassAttendance(@Param('classId') classId: string) {
    return this.gymsService.getClassAttendance(classId);
  }

  @Post('classes/:classId/attendance')
  async markAttendance(
    @Param('classId') classId: string,
    @Body() body: { memberId: string; attended: boolean },
  ) {
    return this.gymsService.markAttendance(classId, body.memberId, body.attended);
  }

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
