import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import config from 'src/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: config.SMTP_HOST,
          secure: false,
          auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
          },
        },
        defaults: {
          from: config.SMTP_USER,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
