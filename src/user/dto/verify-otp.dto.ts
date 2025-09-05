import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ type: "string", description: "Foydalanuvchining emaili" })
  @IsEmail()
  email: string;

  @ApiProperty({ type: "string", description: "Foydalanuvchining otpsi" })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    type: "string",
    description: "Tasdiqlash uchun shifrlangan kalit",
  })
  @IsString()
  @IsNotEmpty()
  verificationKey: string;
}
