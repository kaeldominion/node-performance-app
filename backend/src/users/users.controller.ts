import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
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

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch(':id/admin')
  async setAdmin(@Param('id') id: string, @Body() body: { isAdmin: boolean }) {
    return this.usersService.setAdmin(id, body.isAdmin);
  }
}
