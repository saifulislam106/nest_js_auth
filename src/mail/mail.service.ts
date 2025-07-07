/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASSWORD,
    },
  });

  async sendOtpEmail(to: string, otp: string) {
    await this.transporter.sendMail({
      from: `"TutorXpert" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Reset Password OTP',
      html: `
        <div style="font-family:sans-serif">
          <h2>Your OTP Code</h2>
          <p>Use the following OTP to reset your password:</p>
          <h3>${otp}</h3>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });
  }
}
