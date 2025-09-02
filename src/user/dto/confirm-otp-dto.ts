import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmOtpUserDto {
  @ApiProperty({
    example: 'dostonergashev@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    example: 538309,
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
