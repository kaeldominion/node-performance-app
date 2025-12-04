import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PrismaService } from '../prisma/prisma.service';
import { Webhook } from 'svix';

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const payload = req.rawBody;
    const svixHeaders = {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    };

    try {
      // Verify webhook signature using Svix
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_SECRET_KEY || '');
      const evt = wh.verify(payload as Buffer, svixHeaders) as any;

      // Handle different event types
      switch (evt.type) {
        case 'user.created':
          await this.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(evt.data);
          break;
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook verification failed:', error);
      throw error;
    }
  }

  private async handleUserCreated(data: any) {
    const clerkUserId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null;
    const role = data.public_metadata?.role || 'HOME_USER';
    const isAdmin = data.public_metadata?.isAdmin || false;

    // Create user in our database
    await this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: role as any,
        isAdmin,
      },
      create: {
        email,
        name,
        passwordHash: '', // Clerk handles passwords
        role: role as any,
        isAdmin,
      },
    });
  }

  private async handleUserUpdated(data: any) {
    const email = data.email_addresses?.[0]?.email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null;
    const role = data.public_metadata?.role || 'HOME_USER';
    const isAdmin = data.public_metadata?.isAdmin || false;

    if (email) {
      await this.prisma.user.updateMany({
        where: { email },
        data: {
          name,
          role: role as any,
          isAdmin,
        },
      });
    }
  }

  private async handleUserDeleted(data: any) {
    const clerkUserId = data.id;
    // Optionally delete user from database or mark as deleted
    // For now, we'll keep the user record but you can implement soft delete
  }
}

