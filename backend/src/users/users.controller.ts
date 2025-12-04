import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateDto);
  }
}

