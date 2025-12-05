import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NetworkService } from './network.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('me/network')
@UseGuards(ClerkAuthGuard)
export class NetworkController {
  constructor(private networkService: NetworkService) {}

  @Get('search')
  async searchUsers(@Request() req: any, @Query('q') query: string) {
    return this.networkService.searchUsers(query, req.user.id);
  }

  @Get('search-code')
  async searchByCode(@Request() req: any, @Query('code') code: string) {
    return this.networkService.searchByNetworkCode(code, req.user.id);
  }

  @Get('username/:username')
  async searchByUsername(@Request() req: any, @Param('username') username: string) {
    return this.networkService.searchByUsername(username, req.user.id);
  }

  @Post()
  async sendNetworkRequest(
    @Request() req: any,
    @Body() body: { addresseeId: string },
  ) {
    return this.networkService.sendNetworkRequest(req.user.id, body.addresseeId);
  }

  @Post(':id/accept')
  async acceptNetworkRequest(@Request() req: any, @Param('id') id: string) {
    return this.networkService.acceptNetworkRequest(req.user.id, id);
  }

  @Post(':id/reject')
  async rejectNetworkRequest(@Request() req: any, @Param('id') id: string) {
    return this.networkService.rejectNetworkRequest(req.user.id, id);
  }

  @Delete(':id')
  async removeNetwork(@Request() req: any, @Param('id') networkUserId: string) {
    return this.networkService.removeNetwork(req.user.id, networkUserId);
  }

  @Get()
  async getNetwork(@Request() req: any) {
    return this.networkService.getNetwork(req.user.id);
  }

  @Get('activity')
  async getNetworkActivity(@Request() req: any) {
    return this.networkService.getNetworkActivity(req.user.id);
  }

  @Get('pending')
  async getPendingRequests(@Request() req: any) {
    return this.networkService.getPendingRequests(req.user.id);
  }

  @Get('directory')
  async getUserDirectory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('minLevel') minLevel?: string,
    @Query('maxLevel') maxLevel?: string,
  ) {
    return this.networkService.getUserDirectory(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      minLevel: minLevel ? parseInt(minLevel, 10) : undefined,
      maxLevel: maxLevel ? parseInt(maxLevel, 10) : undefined,
    });
  }

  @Post('generate-code')
  async generateNetworkCode(@Request() req: any) {
    return this.networkService.generateNetworkCode(req.user.id);
  }

  @Post('share-link')
  async generateShareLink(
    @Request() req: any,
    @Body() body: { type?: 'code' | 'user' },
  ) {
    return this.networkService.generateShareLink(req.user.id, body.type || 'code');
  }
}

