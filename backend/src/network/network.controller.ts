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

  @Post('generate-code')
  async generateNetworkCode(@Request() req: any) {
    return this.networkService.generateNetworkCode(req.user.id);
  }
}

