import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('me/notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const notifications = await this.notificationsService.getNotifications(
      req.user.id,
    );
    const unreadCount = await this.notificationsService.getUnreadCount(
      req.user.id,
    );
    return {
      notifications,
      unreadCount,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.id),
    };
  }

  @Post(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async deleteNotification(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(req.user.id, id);
  }

  @Delete('read/all')
  async deleteAllRead(@Request() req: any) {
    return this.notificationsService.deleteAllRead(req.user.id);
  }
}

