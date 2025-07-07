/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private pirsma: PrismaService,
  ) {}

  async register(dto: any) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashed,
      confirm_password: hashed,
    });
    console.log(user);
    return { message: 'User registered successfully', user };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('user not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const hashedOtp = crypto.createHash('sha256').update(dto.otp).digest('hex');

    const otpEntry = await this.pirsma.otp.findFirst({
      where: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otpEntry) throw new BadRequestException('Invalid or expired OTP');

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const hashedOtp = crypto.createHash('sha256').update(dto.otp).digest('hex');

    const otpEntry = await this.pirsma.otp.findFirst({
      where: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otpEntry) throw new BadRequestException('Invalid or expired OTP');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.pirsma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        confirm_password: hashedPassword,
      },
    });
    // Delete the OTP entry after successful password reset
    await this.pirsma.otp.delete({
      where: { id: otpEntry.id },
    });

    return { message: 'Password reset successful' };
  }

  async requestOtp(dto: RequestOtpDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.pirsma.otp.create({
      data: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt,
      },
    });

    // console.log(`OTP for ${user.email}: ${otp}`); // Log the OTP for debugging

    await this.mailService.sendOtpEmail(user.email, otp);

    return { message: 'OTP sent to email' };
  }
}
