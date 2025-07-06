/* eslint-disable prettier/prettier */
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password for the account',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Confirmation of the password',
  })
  @IsString()
  confirm_password: string;
}
