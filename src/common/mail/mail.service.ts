import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { errorCatch } from '../helpers/error-catch';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}
  async sendOtp(email: string, text: string, otp: string) {
    try {
      await this.mailService.sendMail({
        to: email,
        subject: text,
        text: otp,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }
}
