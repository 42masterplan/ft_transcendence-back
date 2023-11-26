import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"${process.env.EMAIL_HOST_NAME}" <${process.env.EMAIL_ADDRESS}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      })
    }),
  ],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
