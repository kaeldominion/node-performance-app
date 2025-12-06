import { Controller, Get, Post, Body, Param, UseGuards, Patch, Query, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  async create(@Request() req: any, @Body() createFeedbackDto: CreateFeedbackDto) {
    // Allow anonymous feedback - userId is optional
    const userId = req.user?.id || null;
    return this.feedbackService.create(userId, createFeedbackDto);
  }

  @Get()
  @UseGuards(ClerkAdminGuard)
  async findAll(@Query() query: any) {
    return this.feedbackService.findAll({
      type: query.type,
      status: query.status,
      userId: query.userId,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('my-feedback')
  @UseGuards(ClerkAuthGuard)
  async findMyFeedback(@Request() req: any) {
    return this.feedbackService.findAll({
      userId: req.user.id,
    });
  }

  @Get(':id')
  @UseGuards(ClerkAdminGuard)
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(ClerkAdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string },
    @Request() req: any,
  ) {
    return this.feedbackService.updateStatus(id, body.status, body.adminNotes, req.user.id);
  }
}

