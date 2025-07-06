/* eslint-disable prettier/prettier */
import { IsEmail, IsString } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    confirm_password: string;
}