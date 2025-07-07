import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'saifulislam106915@gmail.com',
    description: 'The email address associated with the OTP',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The OTP sent to the users email',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  otp: string;

  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'The new password to set. Must be at least 6 characters.',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
