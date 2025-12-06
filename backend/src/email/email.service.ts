import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    // TODO: Integrate with email provider (SendGrid, Resend, etc.)
    // For now, just log the email
    this.logger.log(`Email would be sent to ${to}: ${subject}`);
    this.logger.debug(`HTML: ${html.substring(0, 100)}...`);
    
    // In production, implement actual email sending:
    // - Use SendGrid: https://github.com/sendgrid/sendgrid-nodejs
    // - Use Resend: https://resend.com/docs/send-with-nodejs
    // - Use AWS SES: https://docs.aws.amazon.com/ses/latest/dg/send-email-nodejs.html
  }

  async sendWeeklyCoachSummary(coachId: string, summaryData: any): Promise<void> {
    // TODO: Get coach email from database
    const to = 'coach@example.com'; // Replace with actual coach email
    const subject = 'Your Weekly Coach Summary';
    const html = this.generateWeeklyCoachSummaryHTML(summaryData);
    const text = this.generateWeeklyCoachSummaryText(summaryData);

    await this.sendEmail(to, subject, html, text);
  }

  async sendWeeklyClientSummary(
    clientId: string,
    coachId: string,
    summaryData: any,
  ): Promise<void> {
    // TODO: Get client email from database
    const to = 'client@example.com'; // Replace with actual client email
    const subject = 'Your Weekly Training Summary';
    const html = this.generateWeeklyClientSummaryHTML(summaryData);
    const text = this.generateWeeklyClientSummaryText(summaryData);

    await this.sendEmail(to, subject, html, text);
  }

  async sendCoachInvitation(
    clientEmail: string,
    coachName: string,
    inviteCode: string,
  ): Promise<void> {
    const subject = `${coachName} invited you to be their client`;
    const html = this.generateCoachInvitationHTML(coachName, inviteCode);
    const text = this.generateCoachInvitationText(coachName, inviteCode);

    await this.sendEmail(clientEmail, subject, html, text);
  }

  async sendWorkoutAssigned(
    clientEmail: string,
    coachName: string,
    workoutName: string,
  ): Promise<void> {
    const subject = `New workout assigned: ${workoutName}`;
    const html = this.generateWorkoutAssignedHTML(coachName, workoutName);
    const text = this.generateWorkoutAssignedText(coachName, workoutName);

    await this.sendEmail(clientEmail, subject, html, text);
  }

  // HTML Template Generators
  private generateWeeklyCoachSummaryHTML(data: any): string {
    return `
      <html>
        <body>
          <h1>Weekly Coach Summary</h1>
          <p>New clients: ${data.newClients || 0}</p>
          <p>Workouts assigned: ${data.workoutsAssigned || 0}</p>
          <p>Sessions completed: ${data.sessionsCompleted || 0}</p>
          <h2>Client Progress Highlights</h2>
          ${data.clientHighlights?.map((h: any) => `<p>${h}</p>`).join('') || '<p>No highlights this week</p>'}
          <h2>Upcoming Sessions</h2>
          ${data.upcomingSessions?.map((s: any) => `<p>${s}</p>`).join('') || '<p>No upcoming sessions</p>'}
        </body>
      </html>
    `;
  }

  private generateWeeklyClientSummaryHTML(data: any): string {
    return `
      <html>
        <body>
          <h1>Your Weekly Training Summary</h1>
          <p>Sessions completed: ${data.sessionsCompleted || 0}</p>
          <p>Total duration: ${data.totalDuration || '0'} minutes</p>
          <p>Average RPE: ${data.avgRPE || 'N/A'}</p>
          <h2>Workouts Completed</h2>
          ${data.workouts?.map((w: any) => `<p>${w}</p>`).join('') || '<p>No workouts completed</p>'}
        </body>
      </html>
    `;
  }

  private generateCoachInvitationHTML(coachName: string, inviteCode: string): string {
    return `
      <html>
        <body>
          <h1>${coachName} invited you to be their client</h1>
          <p>You've been invited to work with ${coachName} as your coach.</p>
          <p>Invite code: <strong>${inviteCode}</strong></p>
          <p>Accept the invitation in your dashboard to get started!</p>
        </body>
      </html>
    `;
  }

  private generateWorkoutAssignedHTML(coachName: string, workoutName: string): string {
    return `
      <html>
        <body>
          <h1>New Workout Assigned</h1>
          <p>${coachName} has assigned you a new workout: <strong>${workoutName}</strong></p>
          <p>Check your dashboard to view and start the workout!</p>
        </body>
      </html>
    `;
  }

  // Text Template Generators
  private generateWeeklyCoachSummaryText(data: any): string {
    return `
Weekly Coach Summary
New clients: ${data.newClients || 0}
Workouts assigned: ${data.workoutsAssigned || 0}
Sessions completed: ${data.sessionsCompleted || 0}

Client Progress Highlights:
${data.clientHighlights?.join('\n') || 'No highlights this week'}

Upcoming Sessions:
${data.upcomingSessions?.join('\n') || 'No upcoming sessions'}
    `.trim();
  }

  private generateWeeklyClientSummaryText(data: any): string {
    return `
Your Weekly Training Summary
Sessions completed: ${data.sessionsCompleted || 0}
Total duration: ${data.totalDuration || '0'} minutes
Average RPE: ${data.avgRPE || 'N/A'}

Workouts Completed:
${data.workouts?.join('\n') || 'No workouts completed'}
    `.trim();
  }

  private generateCoachInvitationText(coachName: string, inviteCode: string): string {
    return `
${coachName} invited you to be their client

You've been invited to work with ${coachName} as your coach.
Invite code: ${inviteCode}

Accept the invitation in your dashboard to get started!
    `.trim();
  }

  private generateWorkoutAssignedText(coachName: string, workoutName: string): string {
    return `
New Workout Assigned

${coachName} has assigned you a new workout: ${workoutName}

Check your dashboard to view and start the workout!
    `.trim();
  }
}
