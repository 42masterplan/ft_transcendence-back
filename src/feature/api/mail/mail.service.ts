import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(mail: string, code: number): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: mail,
        subject: '[Amazing Pong] Two Factor Authorization code',
        html: `
          <h3>Hello!</h3>
          <body>
            This is your 2FA authorization code: <br/>
            <strong>${code}</strong>
          </body>
        `, // HTML body content
      });
    } catch (e) {
      console.log(e);
    }
  }
}
